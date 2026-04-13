const BackButton = ({ mobileOnly = false }) => {
    const webUrl = import.meta.env.VITE_PUBLIC_WEB_URL || '/';

    if (mobileOnly) {
        return (
            <div className="back-link-mobile">
                <a href={webUrl} className="btn-back-mobile">
                    VOLVER AL INICIO
                </a>
            </div>
        );
    }

    return (
        <a href={webUrl} className="back-home-btn">
            <span className="arrow-icon">{'<'}</span>
            <span className="back-text">VOLVER</span>
        </a>
    );
};

export default BackButton;
