document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. EFECTO DE APARECER AL SCROLLEAR ---
    const observerOptions = {
        threshold: 0.2 // Se activa cuando se ve el 20% de la sección
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, observerOptions);

    // Seleccionamos todas las secciones que tengan la clase 'fade-in'
    const hiddenElements = document.querySelectorAll('.fade-in');
    hiddenElements.forEach((el) => fadeInObserver.observe(el));


    // --- 2. LÓGICA DEL CARRUSEL SIMPLE ---
    const slides = document.querySelectorAll('.carousel-track img');
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            // Quitamos visibilidad a la foto actual
            slides[currentSlide].style.opacity = 0;
            
            // Calculamos la siguiente
            currentSlide = (currentSlide + 1) % slides.length;
            
            // Le damos visibilidad a la nueva
            slides[currentSlide].style.opacity = 1;
        }, 3000); // 3.5 segundos para que de tiempo a verla
    }

    // --- LÓGICA DEL MENÚ LATERAL (SIDEBAR) ---
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-sidebar');

    // Abrir
    if (menuBtn) {
        menuBtn.onclick = () => {
            sidebar.classList.add('active');
        };
    }

    // Cerrar
    if (closeBtn) {
        closeBtn.onclick = () => {
            sidebar.classList.remove('active');
        };
    }
    // Forzar que la primera foto se vea al cargar
    const firstImg = document.querySelector('.carousel-track img');
    if(firstImg) firstImg.style.opacity = 1;


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
});