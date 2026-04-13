export default function ClassStudentsModal({
    claseTitulo,
    alumnos,
    cargando = false,
    onClose,
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-inner class-students-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}>
                    X
                </button>

                <h2 className="students-modal-title">
                    INSCRIPTOS | {claseTitulo}
                </h2>

                <div className="students-list">
                    {cargando ? (
                        <p className="empty-msg">CARGANDO INSCRIPTOS...</p>
                    ) : alumnos.length > 0 ? (
                        alumnos.map((item, index) => (
                            <div key={item.id} className="student-row">
                                <span className="student-name">
                                    <small>{index + 1}</small>{' '}
                                    {item.alumno?.nombre} {item.alumno?.apellido}
                                </span>

                                <span className="student-extra">
                                    DNI: {item.alumno?.dni || '—'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="empty-msg">
                            NO HAY INSCRIPTOS EN ESTA CLASE
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}