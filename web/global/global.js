const PANEL_URL = window.SUBURBIA_PANEL_URL || 'http://localhost:5173';

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    setupMenu();
    setupSidebarAudio();
    setupHeaderScroll();
    setupJoinNavigation();
});

function setupHeaderScroll() {
    const header = document.querySelector('header');
    const updateHeader = () => header.classList.toggle('header-scrolled', window.scrollY > 24);

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
}

function setupJoinNavigation() {
    const isHomePage = /(?:^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname.endsWith('/');
    if (!isHomePage) return;

    const scrollToJoinContent = behavior => {
        const section = document.getElementById('se-parte');
        if (!section) return;
        const scrollableDistance = Math.max(0, section.offsetHeight - window.innerHeight);
        const target = section.offsetTop + scrollableDistance * .79;
        window.scrollTo({ top: target, behavior });
    };

    document.querySelectorAll('a[href="index.html#se-parte"]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            history.replaceState(null, '', '#se-parte');
            const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
            scrollToJoinContent(behavior);
        });
    });

    if (window.location.hash === '#se-parte') {
        window.requestAnimationFrame(() => scrollToJoinContent('auto'));
    }
}

function injectHeader() {
    const isHomePage =
    /(?:^|\/)index\.html$/.test(window.location.pathname) ||
    window.location.pathname.endsWith('/');

    const homeLink =
        isHomePage
            ? '#inicio'
            : 'index.html';

    document.body.insertAdjacentHTML('afterbegin', `
        <header>
            <a href="${homeLink}" aria-label="Suburbia Boxx, inicio">
                <img src="assets/logo-suburbia.jpg" alt="Suburbia Boxx">
            </a>

            <button class="menu-btn" id="menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="sidebar">
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
            </button>

            <nav aria-label="Navegación principal">
                <ul>
                    <li><a href="${homeLink}">Inicio</a></li>
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
                    <li><a href="${homeLink}">Inicio</a></li>
                    <li><a href="index.html#se-parte">Sé parte</a></li>
                    <li><a href="index.html#quienes-somos">Quiénes somos</a></li>
                    <li><a href="index.html#equipo">Comunidad</a></li>
                    <li><a href="index.html#horarios">Contacto</a></li>
                </ul>

                <div class="sidebar-audio" id="sidebar-audio" hidden>
                    <span class="sidebar-audio-kicker">FIBO - Cheka</span>
                    <button class="sidebar-audio-toggle" id="sidebar-audio-toggle" type="button" aria-pressed="false">
                        <span class="sidebar-audio-icon audio-control-icon" id="sidebar-audio-icon" aria-hidden="true">
                            <span class="audio-icon-play"></span>
                            <span class="audio-icon-pause"><i></i><i></i></span>
                        </span>
                        <span id="sidebar-audio-label">Reproducir canción</span>
                    </button>
                </div>
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

function setupSidebarAudio() {
    const audio = document.getElementById('suburbia-audio');
    const container = document.getElementById('sidebar-audio');
    const button = document.getElementById('sidebar-audio-toggle');
    const icon = document.getElementById('sidebar-audio-icon');
    const label = document.getElementById('sidebar-audio-label');

    if (!audio || !container || !button || !icon || !label) return;

    container.hidden = false;

    const updateState = () => {
        const playing = !audio.paused && !audio.ended;

        label.textContent = playing ? 'Pausar canción' : 'Reproducir canción';
        button.setAttribute('aria-label', label.textContent);
        button.setAttribute('aria-pressed', String(playing));
    };

    button.addEventListener('click', () => {
        document.dispatchEvent(
            new CustomEvent('suburbia:toggle-audio')
        );
    });

    audio.addEventListener('play', updateState);
    audio.addEventListener('pause', updateState);
    audio.addEventListener('ended', updateState);
    updateState();
}
