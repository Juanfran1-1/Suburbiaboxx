document.addEventListener('DOMContentLoaded', () => {
    // 1. INYECTAR COMPONENTES COMUNES
    injectLoader();
    injectHeader();
    injectFooter();

    // 2. ACTIVAR LÓGICA DEL MENÚ (Después de inyectar)
    setupMenu();

    // 3. OBSERVER PARA FADE-IN
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('appear');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

function injectLoader() {
    document.body.insertAdjacentHTML('afterbegin', `
        <div id="loader-wrapper">
            <div class="loader-content">
                <img src="assets/logo-suburbia.jpg" class="logo-base" alt="Suburbia">
                <div class="logo-fill-container">
                    <img src="assets/logo-suburbia.jpg" class="logo-revealed" alt="Suburbia">
                </div>
            </div>
        </div>
    `);
}

function injectHeader() {
    const headerHTML = `
    <header>
        <a href="index.html">
            <img src="assets/logo-suburbia.jpg" alt="Logo" style="width: 90px; height: auto;">
        </a>

        <div class="menu-btn" id="menu-btn">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>

        <nav> 
            <ul>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="se_parte.html">Sé parte</a></li>
                <li><a href="nuestra_historia.html">Nuestra Historia</a></li>
                <li><a href="equipo.html">Nuestro equipo</a></li>
            </ul>
        </nav>

        <div class="sidebar" id="sidebar">
            <div class="close-sidebar" id="close-sidebar">×</div>
            <ul class="sidebar-links">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="se_parte.html">Sé parte</a></li>
                <li><a href="nuestra_historia.html">Nuestra Historia</a></li>
                <li><a href="equipo.html">Nuestro equipo</a></li>
            </ul>

            <div class="Botones_usuarios_mobile">
                <a href="login.html">Iniciar Sesión</a>
                <a href="registro.html">Registrarse</a>
            </div>
        </div>

        <div class="Botones_usuarios">
            <a href="login.html">Iniciar Sesión</a>
            <a href="registro.html">Registrarse</a>
        </div>
    </header>`;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function injectFooter() {
    const footerHTML = `
    <div class="social-pc-container">
        <a href="https://wa.me/tunúmero" target="_blank" class="social-child wsp">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WSP">
        </a>
        <a href="https://instagram.com/tuusuario" target="_blank" class="social-base ig">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="IG">
        </a>
    </div>
    <footer class="footer-suburbia">
        <div class="footer-line"></div>
        <div class="footer-logo"><img src="assets/logo-suburbia.jpg" alt="Suburbia Logo"></div>
        <div class="footer-socials">
            <a href="https://instagram.com/tuusuario" target="_blank">INSTAGRAM</a>
            <span class="footer-dot">•</span>
            <a href="https://wa.me/tunúmero" target="_blank">WHATSAPP</a>
        </div>
    </footer>`;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

function setupMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    if (menuBtn) menuBtn.onclick = () => sidebar.classList.add('active');
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.remove('active');
}

// LOGICA DEL LOADER (Igual que antes)
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    const fill = document.querySelector('.logo-fill-container');

    // 1. Apenas carga el script, el logo empieza a llenarse lento (simulando carga)
    setTimeout(() => {
        fill.style.transition = "height 10s linear"; // Una transición larga por si el internet es lento
        fill.style.height = "100%"; // Lo llevamos al 80% lentamente
    }, 100);

    // Cambiamos la transición a una más rápida para el tramo final
    fill.style.transition = "height 0.4s ease-out";
    fill.style.height = "100%";

    // 3. Desvanecemos el loader completo
    setTimeout(() => {
        loader.classList.add('loader-fade-out');
    }, 500); // Le damos medio segundo para que el usuario vea el logo lleno
});