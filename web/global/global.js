const PANEL_URL = window.SUBURBIA_PANEL_URL || 'http://localhost:5173';

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    setupMenu();
});

function injectHeader() {
    document.body.insertAdjacentHTML('afterbegin', `
        <header>
            <a href="index.html" aria-label="Suburbia Boxx, inicio">
                <img src="assets/logo-suburbia.jpg" alt="Suburbia Boxx">
            </a>

            <button class="menu-btn" id="menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="sidebar">
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
            </button>

            <nav aria-label="Navegación principal">
                <ul>
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="nuestra_historia.html">Nuestra Historia</a></li>
                    <li><a href="index.html#equipo">Nuestro equipo</a></li>
                    <li><a href="se_parte.html">Sé parte</a></li>
                </ul>
            </nav>

            <aside class="sidebar" id="sidebar" aria-label="Menú móvil">
                <button class="close-sidebar" id="close-sidebar" type="button" aria-label="Cerrar menú">×</button>
                <ul class="sidebar-links">
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="nuestra_historia.html">Nuestra Historia</a></li>
                    <li><a href="index.html#equipo">Nuestro equipo</a></li>
                    <li><a href="se_parte.html">Sé parte</a></li>
                </ul>
            </aside>
        </header>
    `);
}

function injectFooter() {
    document.body.insertAdjacentHTML('beforeend', `
        <div class="social-pc-container">
            <a href="https://chat.whatsapp.com/DYA2gbptJUC7cyC4Wrayjm" target="_blank" rel="noopener noreferrer" class="social-child">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
            </a>
            <a href="https://instagram.com/suburbiaboxx/" target="_blank" rel="noopener noreferrer" class="social-base">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram">
            </a>
        </div>

        <footer class="footer-suburbia">
            <div class="footer-main">
                <div class="footer-identity">
                    <img src="assets/logo-suburbia.jpg" alt="Suburbia Boxx">
                    <div>
                        <strong>SUBURBIA BOXX</strong>
                        <p>Más que solamente un club de boxeo.</p>
                    </div>
                </div>

                <div class="footer-column">
                    <span>NAVEGACIÓN</span>
                    <a href="index.html">Inicio</a>
                    <a href="nuestra_historia.html">Nuestra Historia</a>
                    <a href="index.html#equipo">Nuestro equipo</a>
                    <a href="se_parte.html">Sé parte</a>
                </div>

                <div class="footer-column">
                    <span>CONTACTO</span>
                    <a href="https://instagram.com/suburbiaboxx/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                    <a href="https://chat.whatsapp.com/DYA2gbptJUC7cyC4Wrayjm" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
                    <a href="https://maps.google.com/?q=-34.921124,-57.954753" target="_blank" rel="noopener noreferrer">La Plata, Buenos Aires ↗</a>
                </div>

            </div>

            <div class="footer-bottom">
                <p>© ${new Date().getFullYear()} Suburbia Boxx. Todos los derechos reservados.</p>
                <p>Diseñado y desarrollado por <strong>Juan Uceda</strong>.</p>
            </div>
        </footer>
    `);
}

function setupMenu() {
    const openButton = document.getElementById('menu-btn');
    const closeButton = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    const setMenuOpen = open => {
        sidebar.classList.toggle('active', open);
        openButton.setAttribute('aria-expanded', String(open));
    };

    openButton.addEventListener('click', () => setMenuOpen(true));
    closeButton.addEventListener('click', () => setMenuOpen(false));
    sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setMenuOpen(false);
    });
}
