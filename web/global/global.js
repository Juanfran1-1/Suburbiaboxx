const PANEL_URL = window.SUBURBIA_PANEL_URL || 'http://localhost:5173';

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    setupMenu();
    setupHeaderScroll();
});

function setupHeaderScroll() {
    const header = document.querySelector('header');
    const updateHeader = () => header.classList.toggle('header-scrolled', window.scrollY > 24);

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
}

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
                    <li><a href="index.html#se-parte">Sé parte</a></li>
                    <li><a href="index.html#quienes-somos">Quiénes somos</a></li>
                    <li><a href="index.html#equipo">Comunidad</a></li>
                    <li><a href="index.html#horarios">Contacto</a></li>
                </ul>
            </nav>

            <a class="header-cta" href="se_parte.html">Unite al equipo</a>

            <aside class="sidebar" id="sidebar" aria-label="Menú móvil">
                <button class="close-sidebar" id="close-sidebar" type="button" aria-label="Cerrar menú">×</button>
                <ul class="sidebar-links">
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="index.html#se-parte">Sé parte</a></li>
                    <li><a href="index.html#quienes-somos">Quiénes somos</a></li>
                    <li><a href="index.html#equipo">Comunidad</a></li>
                    <li><a href="index.html#horarios">Contacto</a></li>
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
                        <p class="footer-location">La Plata, Buenos Aires.</p>
                        <div class="footer-social-mobile" aria-label="Redes sociales">
                            <a href="https://instagram.com/suburbiaboxx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Suburbia Boxx">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="">
                            </a>
                            <a href="https://chat.whatsapp.com/DYA2gbptJUC7cyC4Wrayjm" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Suburbia Boxx">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="">
                            </a>
                        </div>
                    </div>
                </div>

                <div class="footer-column footer-navigation">
                    <span>NAVEGACIÓN</span>
                    <a href="index.html">Inicio</a>
                    <a href="index.html#se-parte">Sé parte</a>
                    <a href="index.html#quienes-somos">Quiénes somos</a>
                    <a href="index.html#equipo">Comunidad</a>
                    <a href="index.html#horarios">Contacto</a>
                </div>

                <div class="footer-column footer-contact">
                    <span>CONTACTO</span>
                    <a href="https://instagram.com/suburbiaboxx/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                    <a href="https://chat.whatsapp.com/DYA2gbptJUC7cyC4Wrayjm" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
                    <a href="https://maps.google.com/?q=-34.921124,-57.954753" target="_blank" rel="noopener noreferrer">La Plata, Buenos Aires ↗</a>
                </div>

            </div>

            <div class="footer-bottom">
                <p>© <a href="https://jucostudio.com.ar" target="_blank" rel="noopener noreferrer"><strong>JUCO STUDIO ↗</strong></a> ${new Date().getFullYear()} · Todos los derechos reservados.</p>
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
