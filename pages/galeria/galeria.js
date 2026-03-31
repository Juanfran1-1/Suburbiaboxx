document.addEventListener('DOMContentLoaded', () => {
    const filters = document.querySelectorAll('.nav-btn');
    const items = document.querySelectorAll('.media-card');
    const scrollContainer = document.querySelector('.multimedia-scroll-area');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Resetear scroll arriba cada vez que se filtra
            scrollContainer.scrollTop = 0;

            items.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});