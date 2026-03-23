document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('.team-card');
    let currentIndex = 0;
    
    const isMobile = () => window.innerWidth <= 768;

    function runCarousel() {
        if (!isMobile()) {
            // Si volvemos a PC, limpiamos estilos de celu
            cards.forEach(card => {
                card.style.display = '';
                card.style.opacity = '';
                card.classList.remove('active-flip');
            });
            return;
        }

        // 1. Limpiar todo antes de mostrar la siguiente
        cards.forEach(card => {
            card.style.display = 'none';
            card.style.opacity = '0';
            card.classList.remove('active-flip');
        });

        // 2. Mostrar la actual
        const currentCard = cards[currentIndex];
        if (currentCard) {
            currentCard.style.display = 'block';
            
            // Forzamos un pequeño reflow para la transición de opacidad
            setTimeout(() => {
                currentCard.style.opacity = '1';
                
                // 3. Girar a los 1.5 seg
                setTimeout(() => {
                    if (isMobile()) currentCard.classList.add('active-flip');
                }, 1500);

                // 4. Pasar a la siguiente a los 5 seg totales
                setTimeout(() => {
                    if (isMobile()) {
                        currentCard.style.opacity = '0';
                        currentIndex = (currentIndex + 1) % cards.length;
                        runCarousel(); // Loop
                    }
                }, 9000);
            }, 50);
        }
    }

    // Ejecutar solo si estamos en mobile al cargar
    if (isMobile()) {
        runCarousel();
    }

    // Por si el usuario cambia el tamaño de la ventana (opcional)
    window.addEventListener('resize', () => {
        if (isMobile()) {
            // Si pasamos de PC a Celu, arrancamos el carrusel
            if (cards[0].style.display !== 'block' && cards[0].style.display !== 'none') {
                runCarousel();
            }
        }
    });

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