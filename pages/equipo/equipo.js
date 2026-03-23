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
        const teamGrid = document.querySelector('.team-grid');

        teamGrid.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        teamGrid.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        });

        function handleGesture() {
            const currentCard = cards[currentIndex];
            const screenWidth = window.innerWidth;
            
            // Calculamos qué tan largo fue el deslizamiento
            const swipeDistance = Math.abs(touchEndX - touchStartX);

            // Si el deslizamiento fue de más de 50px (para evitar toques accidentales)
            if (swipeDistance > 50) {
                // .toggle agrega la clase si no está, y la saca si ya está.
                // Independientemente de la dirección, la carta gira.
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