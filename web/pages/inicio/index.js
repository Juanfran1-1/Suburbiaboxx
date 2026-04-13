// --- FUNCIONES GLOBALES PARA EL ZOOM ---
window.abrirZoom = function(src) {
    const modal = document.getElementById('modal-planilla');
    const img = document.getElementById('img-expandida');
    img.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Bloquea el scroll
}

window.cerrarZoom = function() {
    document.getElementById('modal-planilla').style.display = 'none';
    document.body.style.overflow = 'auto'; // Habilita el scroll
}

// --- RESTO DE TU LÓGICA EXISTENTE ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. EFECTO DE APARECER AL SCROLLEAR
    const observerOptions = { threshold: 0.2 };

    window.addEventListener('scroll', () => {
        const scrollArrow = document.getElementById('scrollArrow');
        if (window.scrollY > 50) {
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

    document.querySelectorAll('.fade-in').forEach((el) => fadeInObserver.observe(el));

    // 2. LÓGICA DEL CARRUSEL
    const slides = document.querySelectorAll('.carousel-track img');
    let currentSlide = 0;

    if (slides.length > 0) {
        slides[0].style.opacity = 1; // Asegurar que la primera se vea
        setInterval(() => {
            slides[currentSlide].style.opacity = 0;
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].style.opacity = 1;
        }, 3000);
    }
});