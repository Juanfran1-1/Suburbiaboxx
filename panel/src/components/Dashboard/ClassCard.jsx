export default function ClassCard({
    clase,
    onToggleInscripcion,
    onVerInscriptos,
    disabled = false,
    mode = 'alumno',
}) {
    const {
        id,
        titulo,
        profesor,
        hora,
        duracion,
        cupos_ocupados,
        cupo_maximo,
        alumno_inscripto,
    } = clase;

    const sinCupo = cupos_ocupados >= cupo_maximo && !alumno_inscripto;

    return (
        <div className="class-card">
            <div className="class-mobile-main">
                <div className="class-field">
                    <span className="class-label">TÍTULO</span>
                    <span className="class-value">{titulo}</span>
                </div>

                <div className="class-field">
                    <span className="class-label">HORA</span>
                    <span className="class-value">{hora}</span>
                </div>

                <div className="class-field">
                    <span className="class-label">PROFESOR</span>
                    <span className="class-value">{profesor}</span>
                </div>
            </div>

            <div className="class-card-extra">
                <div className="class-field">
                    <span className="class-label">DURACIÓN</span>
                    <span className="class-value">{duracion} MIN</span>
                </div>

                <div className="class-field">
                    <span className="class-label">
                        {mode === 'alumno' ? 'CUPOS' : 'INSCRIPTOS'}
                    </span>
                    <span className="class-value">
                        ({cupos_ocupados}/{cupo_maximo})
                    </span>
                </div>
            </div>

            <div className="class-card-right">
                {/* 🟡 MODO ALUMNO */}
                {mode === 'alumno' && (
                    <button
                        className={`class-action-btn ${
                            sinCupo
                                ? 'completado'
                                : alumno_inscripto
                                ? 'cancelar'
                                : 'asistir'
                        }`}
                        onClick={() => onToggleInscripcion(id)}
                        disabled={sinCupo || disabled}
                    >
                        {disabled
                            ? 'PROCESANDO...'
                            : sinCupo
                            ? 'COMPLETADO'
                            : alumno_inscripto
                            ? 'CANCELAR'
                            : 'ASISTIR'}
                    </button>
                )}

                {/* 🔵 MODO ENTRENADOR / ADMIN */}
                {(mode === 'entrenador' || mode === 'admin') && (
                    <button
                        className="class-action-btn asistir"
                        onClick={() => onVerInscriptos(id)}
                    >
                        VER INSCRIPTOS
                    </button>
                )}
            </div>
        </div>
    );
}