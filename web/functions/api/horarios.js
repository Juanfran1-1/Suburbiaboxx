export async function onRequestGet(context) {
    const { env } = context;

    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'public, max-age=60'
    };

    try {
        if (!env.GOOGLE_SHEETS_HORARIOS_URL) {
            throw new Error(
                'Falta GOOGLE_SHEETS_HORARIOS_URL.'
            );
        }

        const response = await fetch(
            env.GOOGLE_SHEETS_HORARIOS_URL
        );

        if (!response.ok) {
            throw new Error(
                `Google Sheets respondió ${response.status}.`
            );
        }

        const csv =
            await response.text();

        const rows =
            parseCSV(csv);

        const schedule =
            rows
                .map(row => ({
                    dia:
                        String(
                            row.dia || ''
                        ).trim(),

                    hora_inicio:
                        String(
                            row.hora_inicio || ''
                        ).trim(),

                    hora_fin:
                        String(
                            row.hora_fin || ''
                        ).trim(),

                    DT:
                        String(
                            row.DT || ''
                        ).trim()
                }))
                .filter(item =>
                    item.dia &&
                    item.hora_inicio &&
                    item.hora_fin
                );

        return new Response(
            JSON.stringify(schedule),
            {
                status: 200,
                headers
            }
        );

    } catch (error) {
        console.error(
            'Horarios API:',
            error
        );

        return new Response(
            JSON.stringify({
                error:
                    'No se pudieron cargar los horarios.'
            }),
            {
                status: 500,
                headers
            }
        );
    }
}


function parseCSV(csv) {
    const lines =
        csv
            .replace(/\r/g, '')
            .split('\n')
            .filter(line =>
                line.trim()
            );

    if (lines.length < 2) {
        return [];
    }

    const headers =
        parseCSVLine(
            lines[0]
        )
            .map(header =>
                header.trim()
            );

    return lines
        .slice(1)
        .map(line => {
            const values =
                parseCSVLine(line);

            return headers.reduce(
                (row, header, index) => {
                    row[header] =
                        values[index] ?? '';

                    return row;
                },
                {}
            );
        });
}


function parseCSVLine(line) {
    const values = [];

    let current = '';
    let insideQuotes = false;

    for (
        let index = 0;
        index < line.length;
        index += 1
    ) {
        const char =
            line[index];

        const next =
            line[index + 1];

        if (char === '"') {
            if (
                insideQuotes &&
                next === '"'
            ) {
                current += '"';
                index += 1;
            } else {
                insideQuotes =
                    !insideQuotes;
            }

            continue;
        }

        if (
            char === ',' &&
            !insideQuotes
        ) {
            values.push(
                current
            );

            current = '';

            continue;
        }

        current += char;
    }

    values.push(
        current
    );

    return values;
}