import { useEffect, useMemo, useRef } from 'react';
import {
    addDays,
    getEndOfNextMonthISO,
    getMonthDates,
    getTodayISO,
    parseISODate,
} from '../../utils/dateUtils';

const MONTH_LABELS = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
];

export default function MonthDateSelector({ selectedDate, onSelectDate }) {
    const activeDayRef = useRef(null);
    const todayISO = getTodayISO();
    const maxDateISO = getEndOfNextMonthISO();
    const selectedDateObj = parseISODate(selectedDate);

    const dates = useMemo(
        () =>
            getMonthDates(
                selectedDateObj.getFullYear(),
                selectedDateObj.getMonth()
            ).filter((date) => date.iso >= todayISO && date.iso <= maxDateISO),
        [selectedDateObj, todayISO, maxDateISO]
    );

    const canGoPrev = selectedDate > todayISO;
    const canGoNext = selectedDate < maxDateISO;

    const handleMoveDay = (amount) => {
        const next = addDays(selectedDate, amount);

        if (next < todayISO || next > maxDateISO) return;

        onSelectDate(next);
    };

    useEffect(() => {
        activeDayRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        });
    }, [selectedDate]);

    return (
        <div className="month-date-selector">
            <button
                type="button"
                className="month-arrow-btn"
                onClick={() => handleMoveDay(-1)}
                aria-label="Dia anterior"
                disabled={!canGoPrev}
            >
                {'<'}
            </button>

            <div className="month-date-content">
                <div className="month-date-title">
                    {MONTH_LABELS[selectedDateObj.getMonth()]}{' '}
                    {selectedDateObj.getFullYear()}
                </div>

                <div className="dias-selector month-days-strip">
                    {dates.map((date) => {
                        return (
                            <button
                                ref={selectedDate === date.iso ? activeDayRef : null}
                                key={date.iso}
                                className={
                                    selectedDate === date.iso
                                        ? 'dia-btn month-day-btn active'
                                        : 'dia-btn month-day-btn'
                                }
                                onClick={() => {
                                    onSelectDate(date.iso);
                                }}
                                type="button"
                            >
                                <span>{date.dayNumber}</span>
                                <small>{date.dayLabel}</small>
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                type="button"
                className="month-arrow-btn"
                onClick={() => handleMoveDay(1)}
                aria-label="Dia siguiente"
                disabled={!canGoNext}
            >
                {'>'}
            </button>
        </div>
    );
}
