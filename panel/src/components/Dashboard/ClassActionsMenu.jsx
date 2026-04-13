import { useEffect, useRef, useState } from 'react';

export default function ClassActionsMenu({
    clase,
    onEdit,
    onDelete,
    onToggleActive,
    showEdit = true,
    showDelete = true,
    showToggleActive = true,
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="class-actions-menu" ref={ref}>
            <button
                type="button"
                className="class-dots-btn"
                onClick={() => setOpen((prev) => !prev)}
            >
                ⋮
            </button>

            {open && (
                <div className="class-actions-dropdown">
                    {showEdit && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onEdit(clase);
                            }}
                        >
                            EDITAR
                        </button>
                    )}

                    {showToggleActive && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onToggleActive(clase);
                            }}
                        >
                            {clase.activa ? 'DESACTIVAR' : 'ACTIVAR'}
                        </button>
                    )}

                    {showDelete && (
                        <button
                            type="button"
                            className="danger"
                            onClick={() => {
                                setOpen(false);
                                onDelete(clase);
                            }}
                        >
                            ELIMINAR
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
