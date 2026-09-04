const scrollArrow = document.getElementById('scrollArrow');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

scrollArrow?.addEventListener('click', () => {
    document.getElementById('se-parte')?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth'
    });
});

window.addEventListener('scroll', () => {
    scrollArrow?.classList.toggle('scroll-hidden', window.scrollY > 50);
}, { passive: true });

const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const dots = Array.from(document.querySelectorAll('.carousel-dot'));
const previousButton = document.getElementById('carousel-prev');
const nextButton = document.getElementById('carousel-next');
const currentSlideLabel = document.getElementById('current-slide');
let currentSlide = 0;
let carouselTimer;
let touchStartX = 0;

/* =========================================================
   COMMUNITY - INSTAGRAM
   ========================================================= */

const instagramUsername =
    document.getElementById(
        'instagram-username'
    );

const instagramPosts =
    document.getElementById(
        'instagram-posts'
    );

const instagramFollowers =
    document.getElementById(
        'instagram-followers'
    );

const instagramLink =
    document.getElementById(
        'instagram-link'
    );


function formatSocialNumber(value) {

    if (
        typeof value === 'string' &&
        value.trim()
    ) {
        return value;
    }

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return '—';
    }

    return new Intl
        .NumberFormat('es-AR')
        .format(number);
}


async function loadInstagramData() {

    try {

        const response =
            await fetch(
                '/api/community'
            );

        if (!response.ok) {
            throw new Error(
                'No se pudieron cargar los datos de Instagram.'
            );
        }

        const data =
            await response.json();

        if (!data.instagram) {
            throw new Error(
                'La respuesta no contiene información de Instagram.'
            );
        }

        const instagram =
            data.instagram;


        if (instagramUsername) {
            instagramUsername.textContent =
                instagram.username ||
                '@suburbiaboxx';
        }


        if (instagramPosts) {
            instagramPosts.textContent =
                formatSocialNumber(
                    instagram.posts
                );
        }


        if (instagramFollowers) {
            instagramFollowers.textContent =
                formatSocialNumber(
                    instagram.followers
                );
        }


        if (
            instagramLink &&
            instagram.url
        ) {
            instagramLink.href =
                instagram.url;
        }

    } catch (error) {

        console.warn(
            'Instagram data:',
            error.message
        );

    }
}


loadInstagramData();


/*
=========================================================
INSTAGRAM MINI FEED - PENDIENTE META API
=========================================================

Cuando conectemos la API oficial de Meta,
podemos volver a activar esta lógica.

const instagramFeed =
    document.getElementById(
        'instagram-feed'
    );


function createInstagramPost(post) {

    const link =
        document.createElement(
            'a'
        );

    link.className =
        'instagram-post';

    link.href =
        post.url || '#';

    link.target =
        '_blank';

    link.rel =
        'noopener noreferrer';

    link.setAttribute(
        'aria-label',
        'Ver publicación en Instagram'
    );


    const image =
        document.createElement(
            'img'
        );

    image.src =
        post.image;

    image.alt =
        'Publicación reciente de Suburbia Boxx';

    image.loading =
        'lazy';


    const type =
        String(
            post.type || ''
        )
            .toUpperCase();


    if (
        type === 'VIDEO' ||
        type === 'REEL'
    ) {

        const badge =
            document.createElement(
                'span'
            );

        badge.className =
            'instagram-post-type';

        badge.textContent =
            '▶';

        badge.setAttribute(
            'aria-hidden',
            'true'
        );

        link.append(
            badge
        );
    }


    if (
        type === 'CAROUSEL_ALBUM' ||
        type === 'CAROUSEL'
    ) {

        const badge =
            document.createElement(
                'span'
            );

        badge.className =
            'instagram-post-type';

        badge.textContent =
            '▣';

        badge.setAttribute(
            'aria-hidden',
            'true'
        );

        link.append(
            badge
        );
    }


    const label =
        document.createElement(
            'span'
        );

    label.className =
        'instagram-post-label';

    label.textContent =
        'VER PUBLICACIÓN ↗';


    link.append(
        image,
        label
    );


    return link;
}


function renderInstagramFeed(posts) {

    if (!instagramFeed) {
        return;
    }


    const latestPosts =
        Array.isArray(posts)
            ?
            posts
                .filter(post =>
                    post?.image &&
                    post?.url
                )
                .slice(
                    0,
                    3
                )
            :
            [];


    if (!latestPosts.length) {
        return;
    }


    instagramFeed
        .replaceChildren(
            ...latestPosts.map(
                createInstagramPost
            )
        );
}

*/


async function loadInstagramData() {
    try {
        const response =
            await fetch(
                '/api/community'
            );


        if (!response.ok) {
            throw new Error(
                'No se pudieron cargar los datos de Instagram.'
            );
        }


        const data =
            await response.json();


        if (!data.instagram) {
            throw new Error(
                'La respuesta no contiene información de Instagram.'
            );
        }


        const instagram =
            data.instagram;


        if (instagramUsername) {
            instagramUsername.textContent =
                instagram.username
                ||
                '@suburbiaboxx';
        }


        if (instagramPosts) {
            instagramPosts.textContent =
                formatSocialNumber(
                    instagram.posts
                );
        }


        if (instagramFollowers) {
            instagramFollowers.textContent =
                formatSocialNumber(
                    instagram.followers
                );
        }


        if (
            instagramLink &&
            instagram.url
        ) {
            instagramLink.href =
                instagram.url;
        }


        renderInstagramFeed(
            instagram.latestPosts
        );

    } catch (error) {
        console.warn(
            'Instagram data:',
            error.message
        );


        if (instagramFeed) {
            const message =
                document.createElement(
                    'p'
                );

            message.className =
                'instagram-feed-status';

            message.textContent =
                'Las publicaciones recientes no están disponibles.';

            instagramFeed
                .replaceChildren(
                    message
                );
        }
    }
}


loadInstagramData();

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
    if (!reduceMotion) {
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

showSlide(0);
restartCarousel();

async function loadSchedule() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;

    try {
        const response = await fetch('functions/api/horarios');
        if (!response.ok) throw new Error('No se pudieron cargar los horarios.');
        const schedule = await response.json();
        const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const groupedSchedule = schedule.reduce((groups, item) => {
            if (!groups.has(item.dia)) groups.set(item.dia, []);
            groups.get(item.dia).push(item);
            return groups;
        }, new Map());
        grid.replaceChildren();

        dayOrder.forEach(day => {
            const classes = groupedSchedule.get(day);
            if (!classes?.length) return;

            const column = document.createElement('section');
            column.className = 'schedule-day';
            const heading = document.createElement('h4');
            heading.textContent = day;
            column.append(heading);

            classes
                .sort((first, second) => first.hora_inicio.localeCompare(second.hora_inicio))
                .forEach(item => {
                    const classBlock = document.createElement('div');
                    classBlock.className = 'schedule-slot';
                    const time = document.createElement('time');
                    time.textContent = `${item.hora_inicio}–${item.hora_fin}`;
                    const dt = document.createElement('strong');
                    dt.textContent = item.DT;
                    classBlock.append(time, dt);
                    column.append(classBlock);
                });

            grid.append(column);
        });

        if (!grid.children.length) throw new Error('Todavía no hay horarios disponibles.');
    } catch (error) {
        console.error('No se pudo cargar la grilla de horarios:', error);
        const fallback = document.createElement('div');
        fallback.className = 'schedule-fallback';
        const message = document.createElement('p');
        message.textContent = 'Consultanos la grilla semanal actualizada.';
        const contactLink = document.createElement('a');
        contactLink.href = 'https://chat.whatsapp.com/DYA2gbptJUC7cyC4Wrayjm';
        contactLink.target = '_blank';
        contactLink.rel = 'noopener noreferrer';
        contactLink.textContent = 'Consultar horarios →';
        fallback.append(message, contactLink);
        grid.replaceChildren(fallback);
    }
}

loadSchedule();

const revealGroups = [
    ['.about-title', '.about-copy'],
    ['.community-section .section-heading > *'],
    ['.community-carousel'],
    ['.visit-section .section-heading > *'],
    ['.info-card']
];

const revealElements = revealGroups.flatMap(selectors =>
    selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)))
);

revealElements.forEach((element, index) => {
    element.classList.add('reveal', `reveal-delay-${Math.min(index % 3, 2)}`);
});

if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('reveal-visible'));
} else {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('reveal-visible');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: .14, rootMargin: '0px 0px -40px' });

    revealElements.forEach(element => revealObserver.observe(element));
}

const sequenceSection = document.querySelector('.scroll-sequence');
const sequenceCanvas = document.querySelector('.sequence-canvas');
const sequenceContent = document.querySelector('.sequence-content');
const sequenceShade = document.querySelector('.sequence-shade');

if (sequenceSection && sequenceCanvas && !reduceMotion) {
    const context = sequenceCanvas.getContext('2d');
    const frameCount = 48;
    const frames = Array(frameCount);
    let currentFrame = 0;
    let lastImpactState = false;
    let ticking = false;

    const framePath = index => `assets/frames-boxeo/frame-${String(index + 1).padStart(3, '0')}.jpg`;

    function drawFrame(index) {
        const image = frames[index];
        if (!image?.complete || !image.naturalWidth) return;

        const canvasRatio = sequenceCanvas.width / sequenceCanvas.height;
        const imageRatio = image.naturalWidth / image.naturalHeight;
        let sourceWidth = image.naturalWidth;
        let sourceHeight = image.naturalHeight;
        let sourceX = 0;
        let sourceY = 0;

        if (imageRatio > canvasRatio) {
            sourceWidth = image.naturalHeight * canvasRatio;
            sourceX = (image.naturalWidth - sourceWidth) / 2;
        } else {
            sourceHeight = image.naturalWidth / canvasRatio;
            sourceY = (image.naturalHeight - sourceHeight) / 2;
        }

        context.clearRect(0, 0, sequenceCanvas.width, sequenceCanvas.height);
        context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sequenceCanvas.width, sequenceCanvas.height);
    }

    function loadFrame(index) {
        if (frames[index]) return;
        const image = new Image();
        frames[index] = image;
        image.decoding = 'async';
        image.src = framePath(index);
        image.addEventListener('load', () => {
            if (index === currentFrame) drawFrame(index);
        }, { once: true });
    }

    function resizeSequence() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        sequenceCanvas.width = Math.round(window.innerWidth * pixelRatio);
        sequenceCanvas.height = Math.round(window.innerHeight * pixelRatio);
        drawFrame(currentFrame);
    }

    function updateSequence() {
        const rect = sequenceSection.getBoundingClientRect();
        const scrollDistance = sequenceSection.offsetHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
        // El golpe ocupa la primera parte; el tramo final queda libre para leer el CTA.
        const frameProgress = Math.min(progress / .62, 1);
        const nextFrame = Math.round(frameProgress * (frameCount - 1));
        const revealProgress = Math.max(0, Math.min(1, (progress - .64) / .12));

        if (nextFrame !== currentFrame) {
            currentFrame = nextFrame;
            loadFrame(currentFrame);
            drawFrame(currentFrame);
        }

        const isImpact = currentFrame >= 14 && currentFrame <= 18;
        if (isImpact && !lastImpactState) {
            sequenceCanvas.classList.remove('sequence-impact');
            void sequenceCanvas.offsetWidth;
            sequenceCanvas.classList.add('sequence-impact');
        }
        lastImpactState = isImpact;

        sequenceShade.style.opacity = String(revealProgress * .72);
        sequenceContent.style.opacity = String(revealProgress);
        sequenceContent.style.transform = `translateY(${(1 - revealProgress) * 34}px)`;
        sequenceContent.style.pointerEvents = revealProgress > .9 ? 'auto' : 'none';
        ticking = false;
    }

    function requestSequenceUpdate() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateSequence);
    }

    loadFrame(0);
    loadFrame(frameCount - 1);
    resizeSequence();
    window.addEventListener('resize', resizeSequence, { passive: true });
    window.addEventListener('scroll', requestSequenceUpdate, { passive: true });
    updateSequence();

    const preloadFrames = () => {
        for (let index = 1; index < frameCount - 1; index += 1) loadFrame(index);
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadFrames, { timeout: 1800 });
    } else {
        window.setTimeout(preloadFrames, 400);
    }
}
