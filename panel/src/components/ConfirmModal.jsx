export default function ConfirmModal({
    title = 'CONFIRMAR ACCIÓN',
    message = '¿ESTÁS SEGURO?',
    confirmText = 'CONFIRMAR',
    cancelText = 'CANCELAR',
    onConfirm,
    onCancel,
    danger = false,
    loading = false,
}) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-inner confirm-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="confirm-modal-close"
                    onClick={onCancel}
                    disabled={loading}
                    aria-label="Cerrar modal"
                >
                    X
                </button>

                <h2 className="confirm-modal-title">{title}</h2>
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="confirm-btn cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`confirm-btn ${danger ? 'danger' : 'primary'}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'PROCESANDO...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
