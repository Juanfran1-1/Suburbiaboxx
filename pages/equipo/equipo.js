document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('.team-card');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.getElementById('next-card');
    const prevBtn = document.getElementById('prev-card');
    let currentIndex = 0;
    
    // Variables para el SWIPE
    let touchStartX = 0;
    let touchEndX = 0;

    const isMobile = () => window.innerWidth <= 768;

    function updateGallery(direction) {
        cards.forEach((card, index) => {
            card.classList.remove('active', 'active-flip');
            card.style.display = 'none';
            dots[index].classList.remove('active');
        });

        cards[currentIndex].style.display = 'block';
        setTimeout(() => cards[currentIndex].classList.add('active'), 10);
        dots[currentIndex].classList.add('active');
    }

    if (isMobile()) {
        updateGallery();

        // NAVEGACIÓN POR FLECHAS
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % cards.length;
            updateGallery();
        };

        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            updateGallery();
        };

        // LÓGICA DE GESTOS (SWIPE)
        // LÓGICA DE GESTOS (SWIPE) MEJORADA
        const teamGrid = document.querySelector('.team-grid');

        teamGrid.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true}); // passive ayuda al rendimiento del scroll

        teamGrid.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        }, {passive: true});

        function handleGesture() {
            const currentCard = cards[currentIndex];
            const swipeDistance = Math.abs(touchEndX - touchStartX);

            // Solo si el movimiento es claramente horizontal (más de 50px)
            if (swipeDistance > 50) {
                currentCard.classList.toggle('active-flip');
            }
        }
    }

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
});