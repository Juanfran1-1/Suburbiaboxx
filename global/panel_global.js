document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // 1. Inyectamos la estructura necesaria: Hamburguesa, Overlay y Sidebar
    const globalUI = `
        <div class="menu-icon" id="openMenu">
            <span></span><span></span><span></span>
        </div>

        <div class="overlay" id="overlay"></div>

        <nav class="side-menu" id="sideMenu">
            <div class="menu-header">
                <img src="assets/logo-suburbia.jpg" alt="Logo Suburbia">
                <h3>SUBURBIA BOXX</h3>
            </div>
            <ul class="menu-links">
                <li><a href="credencial.html">INICIO</a></li>
                <li><a href="clases.html">MIS CLASES</a></li>
                <li><a href="pagos.html">PAGAR CUOTA</a></li>
                <li><a href="galeria.html">GALERÍA</a></li>
                <li><a href="feedback.html">MI PROGRESO</a></li>
                <li><a href="perfil.html">MI PERFIL</a></li>
                <hr class="menu-hr">
                <li><a href="../index.html" class="logout">CERRAR SESIÓN</a></li>
            </ul>
        </nav>
    `;

    // Insertamos todo al principio del body
    body.insertAdjacentHTML('afterbegin', globalUI);

    // 2. Lógica de funcionamiento
    const menuBtn = document.getElementById('openMenu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    // Abrir
    menuBtn.addEventListener('click', () => {
        sideMenu.classList.add('open');
        overlay.classList.add('active');
    });

    // Cerrar al tocar el overlay
    overlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Marcar automáticamente el link de la página donde estamos
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll('.menu-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});