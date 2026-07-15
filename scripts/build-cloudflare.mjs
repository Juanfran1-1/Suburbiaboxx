import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import readXlsxFile from 'read-excel-file/node';

const root = process.cwd();
const outputDir = path.join(root, 'dist');
const webDir = path.join(root, 'web');
const panelDir = path.join(root, 'panel');
const panelDistDir = path.join(panelDir, 'dist');
const outputPanelDir = path.join(outputDir, 'panel');
const panelNodeModulesDir = path.join(panelDir, 'node_modules');
const scheduleWorkbookPath = path.join(webDir, 'data', 'horarios.xlsx');
const panelStaticRoutes = [
    'login',
    'register',
    'forgot-password',
    'update-password',
    'alumno/inicio',
    'alumno/clases',
    'alumno/pagos',
    'alumno/progreso',
    'alumno/perfil',
    'entrenador/inicio',
    'entrenador/clases',
    'entrenador/progreso',
    'entrenador/perfil',
    'admin/inicio',
    'admin/clases',
    'admin/pagos',
    'admin/progreso',
];

function run(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const isWindows = process.platform === 'win32';
        const child = isWindows
            ? spawn(`${command} ${args.join(' ')}`, {
                stdio: 'inherit',
                shell: true,
                ...options,
            })
            : spawn(command, args, {
                stdio: 'inherit',
                ...options,
            });

        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
            }
        });
    });
}

if (!existsSync(webDir) || !existsSync(panelDir)) {
    throw new Error('Este build necesita las carpetas web y panel en la raiz del repo.');
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await cp(webDir, outputDir, {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}.git`),
});

async function buildScheduleData() {
    if (!existsSync(scheduleWorkbookPath)) {
        throw new Error('Falta web/data/horarios.xlsx.');
    }

    const workbookSheets = await readXlsxFile(scheduleWorkbookPath);
    const rows = workbookSheets[0]?.data ?? workbookSheets;
    const headers = rows[0].map(value => String(value).trim());
    const expectedHeaders = ['dia', 'hora_inicio', 'hora_fin', 'DT'];

    if (expectedHeaders.some((header, index) => headers[index] !== header)) {
        throw new Error(`El Excel de horarios debe tener estas columnas: ${expectedHeaders.join(', ')}.`);
    }

    const horarios = [];
    const formatExcelTime = value => {
        if (value instanceof Date) {
            return `${String(value.getUTCHours()).padStart(2, '0')}:${String(value.getUTCMinutes()).padStart(2, '0')}`;
        }
        if (typeof value === 'number') {
            const totalMinutes = Math.round(value * 24 * 60) % (24 * 60);
            return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
        }
        return String(value).trim();
    };

    rows.slice(1).forEach(row => {
        const [dia, horaInicio, horaFin, dt] = row;
        if (![dia, horaInicio, horaFin, dt].every(value => value !== null && value !== undefined && value !== '')) return;
        horarios.push({
            dia: String(dia).trim(),
            hora_inicio: formatExcelTime(horaInicio),
            hora_fin: formatExcelTime(horaFin),
            DT: String(dt).trim(),
        });
    });

    const scheduleJson = `${JSON.stringify(horarios, null, 2)}\n`;
    await mkdir(path.join(outputDir, 'data'), { recursive: true });
    await writeFile(path.join(webDir, 'data', 'horarios.json'), scheduleJson);
    await writeFile(path.join(outputDir, 'data', 'horarios.json'), scheduleJson);
}

await buildScheduleData();

if (!existsSync(panelNodeModulesDir)) {
    await run('npm', ['ci'], { cwd: panelDir });
}

await run('npm', ['run', 'build:cloudflare'], {
    cwd: panelDir,
    env: process.env,
});

await rm(outputPanelDir, { recursive: true, force: true });
await cp(panelDistDir, outputPanelDir, { recursive: true });

for (const route of panelStaticRoutes) {
    const routeDir = path.join(outputPanelDir, route);
    await mkdir(routeDir, { recursive: true });
    await cp(path.join(outputPanelDir, 'index.html'), path.join(routeDir, 'index.html'));
}

await writeFile(
    path.join(outputDir, '_redirects'),
    [
        '/equipo.html /index.html#equipo 301',
        '/panel /panel/index.html 200',
        '/panel/ /panel/index.html 200',
        '/panel/* /panel/index.html 200',
        '',
    ].join('\n'),
);

console.log('Build listo en dist/. Web en / y panel en /panel.');
