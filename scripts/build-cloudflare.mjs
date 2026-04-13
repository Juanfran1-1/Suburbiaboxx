import { cp, mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'dist');
const webDir = path.join(root, 'web');
const panelDir = path.join(root, 'panel');
const panelDistDir = path.join(panelDir, 'dist');
const outputPanelDir = path.join(outputDir, 'panel');
const panelNodeModulesDir = path.join(panelDir, 'node_modules');

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

if (!existsSync(panelNodeModulesDir)) {
    await run('npm', ['ci'], { cwd: panelDir });
}

await run('npm', ['run', 'build:cloudflare'], {
    cwd: panelDir,
    env: process.env,
});

await rm(outputPanelDir, { recursive: true, force: true });
await cp(panelDistDir, outputPanelDir, { recursive: true });

console.log('Build listo en dist/. Web en / y panel en /panel.');
