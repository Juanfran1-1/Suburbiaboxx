export default function ClassHistoryList({ clases }) {
    if (!clases?.length) {
        return <div className="sin-clases-msg">NO HAY CLASES EN EL HISTORIAL</div>;
    }

    return (
        <div className="progreso-scroll-list">
            {clases.map((clase) => (
                <div key={clase.id} className="progreso-class-item">
                    <strong>{clase.titulo}</strong>
                    <span>
                        {clase.fecha} | {clase.hora} | {clase.duracion} MIN
                    </span>
                    <small>
                        {clase.entrenador} - {clase.estado?.toUpperCase()}
                    </small>
                </div>
            ))}
        </div>
    );
}
