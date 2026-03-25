        // --- LÓGICA DEL MENÚ LATERAL ---
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtnmenu = document.getElementById('close-sidebar');

    if (menuBtn) {
        menuBtn.onclick = () => sidebar.classList.add('active');
    }

    if (closeBtnmenu) {
        closeBtnmenu.onclick = () => sidebar.classList.remove('active');
    }

    
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