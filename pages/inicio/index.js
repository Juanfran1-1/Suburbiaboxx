document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. EFECTO DE APARECER AL SCROLLEAR ---
    const observerOptions = {
        threshold: 0.2 // Se activa cuando se ve el 20% de la sección
    };

    window.addEventListener('scroll', () => {
        const scrollArrow = document.getElementById('scrollArrow');
        if (window.scrollY > 50) { // Si bajó más de 50px
            scrollArrow.classList.add('scroll-hidden');
        } else {
            scrollArrow.classList.remove('scroll-hidden');
        }
    });

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
    // Forzar que la primera foto se vea al cargar
    const firstImg = document.querySelector('.carousel-track img');
    if(firstImg) firstImg.style.opacity = 1;
});