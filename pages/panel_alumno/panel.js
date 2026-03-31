document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.menu-icon');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    // Abrir menú
    menuBtn.addEventListener('click', () => {
        sideMenu.classList.add('open');
        overlay.classList.add('active');
    });

    // Cerrar menú (al tocar el fondo oscuro)
    overlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });
});