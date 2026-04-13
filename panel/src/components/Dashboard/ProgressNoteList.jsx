import { useState } from 'react';

export default function ProgressNoteList({ notas, canManageNota, onEdit, onDelete }) {
    const [openId, setOpenId] = useState(notas?.[0]?.id || null);

    if (!notas?.length) {
        return <div className="sin-clases-msg">NO HAY OBSERVACIONES CARGADAS</div>;
    }

    return (
        <div className="progreso-scroll-list">
            {notas.map((nota) => {
                const abierta = openId === nota.id;

                return (
                    <div key={nota.id} className="progreso-note-item">
                        <button
                            type="button"
                            className="progreso-note-head"
                            onClick={() => setOpenId(abierta ? null : nota.id)}
                        >
                            <span>{abierta ? 'v' : '>'}</span>
                            <strong>
                                {nota.fecha} - {nota.autor}
                            </strong>
                            <small>{nota.tipo.toUpperCase()}</small>
                        </button>

                        {abierta && (
                            <div className="progreso-note-body">
                                <h4>{nota.titulo}</h4>
                                <p>{nota.nota}</p>
                                {canManageNota?.(nota) && (
                                    <div className="progreso-note-actions">
                                        <button type="button" onClick={() => onEdit(nota)}>
                                            EDITAR
                                        </button>
                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => onDelete(nota)}
                                        >
                                            ELIMINAR
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
