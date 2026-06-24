const scrollArrow = document.getElementById('scrollArrow');
const scheduleButton = document.querySelector('.schedule-image');
const scheduleModal = document.getElementById('modal-planilla');
const expandedSchedule = document.getElementById('img-expandida');
const closeScheduleButton = document.querySelector('.cerrar-btn');

window.addEventListener('scroll', () => {
    scrollArrow?.classList.toggle('scroll-hidden', window.scrollY > 50);
}, { passive: true });

function openSchedule() {
    expandedSchedule.src = scheduleButton.querySelector('img').src;
    scheduleModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeScheduleButton.focus();
}

function closeSchedule() {
    scheduleModal.classList.remove('open');
    document.body.style.overflow = '';
    scheduleButton.focus();
}

scheduleButton?.addEventListener('click', openSchedule);
closeScheduleButton?.addEventListener('click', closeSchedule);
scheduleModal?.addEventListener('click', (event) => {
    if (event.target === scheduleModal) closeSchedule();
});

const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const dots = Array.from(document.querySelectorAll('.carousel-dot'));
const previousButton = document.getElementById('carousel-prev');
const nextButton = document.getElementById('carousel-next');
const currentSlideLabel = document.getElementById('current-slide');
let currentSlide = 0;
let carouselTimer;
let touchStartX = 0;

function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === currentSlide;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentSlide;
        dot.classList.toggle('active', isActive);
        dot.toggleAttribute('aria-current', isActive);
    });

    currentSlideLabel.textContent = String(currentSlide + 1).padStart(2, '0');
}

function restartCarousel() {
    window.clearInterval(carouselTimer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        carouselTimer = window.setInterval(() => showSlide(currentSlide + 1), 4500);
    }
}

previousButton?.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    restartCarousel();
});

nextButton?.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    restartCarousel();
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
        restartCarousel();
    });
});

document.querySelector('.carousel-track')?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

document.querySelector('.carousel-track')?.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;

    showSlide(currentSlide + (distance < 0 ? 1 : -1));
    restartCarousel();
}, { passive: true });

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && scheduleModal.classList.contains('open')) {
        closeSchedule();
    }
});

showSlide(0);
restartCarousel();
