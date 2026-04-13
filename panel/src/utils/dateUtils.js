const DIA_KEYS = [
    'domingo',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
];

const DIA_LABELS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

export function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getTodayISO() {
    return toISODate(new Date());
}

export function parseISODate(fechaISO) {
    const [year, month, day] = fechaISO.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function addDays(fechaISO, amount) {
    const date = parseISODate(fechaISO);
    date.setDate(date.getDate() + amount);

    return toISODate(date);
}

export function getEndOfNextMonthISO() {
    const today = new Date();
    return toISODate(new Date(today.getFullYear(), today.getMonth() + 2, 0));
}

export function getDiaSemanaKey(fechaISO) {
    const date = parseISODate(fechaISO);

    return DIA_KEYS[date.getDay()];
}

export function getMonthDates(year, monthIndex) {
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(year, monthIndex, index + 1);
        return {
            iso: toISODate(date),
            dayNumber: date.getDate(),
            dayLabel: DIA_LABELS[date.getDay()],
        };
    });
}
