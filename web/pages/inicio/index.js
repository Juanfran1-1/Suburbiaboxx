/* =========================================================
   SUBURBIA INTRO + SOUND
   ========================================================= */

const suburbiaIntro =
    document.getElementById(
        'site-intro'
    );

const suburbiaIntroLogo =
    document.getElementById(
        'site-intro-logo'
    );

const suburbiaIntroLabel =
    document.getElementById(
        'site-intro-label'
    );

const suburbiaIntroEnter =
    document.getElementById(
        'site-intro-enter'
    );

const suburbiaAudio =
    document.getElementById(
        'suburbia-audio'
    );

const suburbiaPlayer =
    document.getElementById(
        'suburbia-player'
    );

const suburbiaPlayerToggle =
    document.getElementById(
        'suburbia-player-toggle'
    );

const suburbiaPlayerIcon =
    document.getElementById(
        'suburbia-player-icon'
    );

const suburbiaPlayerProgress =
    document.getElementById(
        'suburbia-player-progress'
    );

const suburbiaPlayerProgressFill =
    document.getElementById(
        'suburbia-player-progress-fill'
    );

const suburbiaPlayerTime =
    document.getElementById(
        'suburbia-player-time'
    );

const suburbiaPlayerDuration =
    document.getElementById(
        'suburbia-player-duration'
    );

const suburbiaPlayerViewToggle =
    document.getElementById(
        'suburbia-player-view-toggle'
    );


function formatAudioTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return '0:00';
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        Math.floor(
            seconds % 60
        );

    return (
        `${minutes}:` +
        String(remainingSeconds)
            .padStart(2, '0')
    );
}


function updateSuburbiaPlayer() {

    if (!suburbiaAudio) {
        return;
    }

    const duration =
        suburbiaAudio.duration;

    const currentTime =
        suburbiaAudio.currentTime;

    const progress =
        Number.isFinite(duration) &&
        duration > 0
            ?
            (
                currentTime /
                duration
            ) * 100
            :
            0;

    if (suburbiaPlayerProgressFill) {
        suburbiaPlayerProgressFill.style.width =
            `${progress}%`;
    }

    if (suburbiaPlayerTime) {
        suburbiaPlayerTime.textContent =
            formatAudioTime(
                currentTime
            );
    }

    if (suburbiaPlayerDuration) {
        suburbiaPlayerDuration.textContent =
            formatAudioTime(
                duration
            );
    }
}


suburbiaPlayerViewToggle?.addEventListener(
    'click',
    () => {
        if (window.gsap) {
            gsap.killTweensOf(
                suburbiaPlayer
            );

            gsap.set(
                suburbiaPlayer,
                {
                    clearProps:
                        'width,height,minHeight,aspectRatio'
                }
            );
        }

        const initialRect =
            suburbiaPlayer.getBoundingClientRect();

        const compact =
            suburbiaPlayer.classList.toggle(
                'is-compact'
            );

        const finalRect =
            suburbiaPlayer.getBoundingClientRect();

        suburbiaPlayerViewToggle.setAttribute(
            'aria-expanded',
            String(!compact)
        );

        suburbiaPlayerViewToggle.setAttribute(
            'aria-label',
            compact
                ? 'Expandir reproductor'
                : 'Compactar reproductor'
        );

        const reducePlayerMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

        if (
            !window.gsap ||
            reducePlayerMotion
        ) {
            return;
        }

        gsap.killTweensOf(
            suburbiaPlayer
        );

        gsap.fromTo(
            suburbiaPlayer,
            {
                width: initialRect.width,
                height: initialRect.height,
                minHeight: initialRect.height,
                aspectRatio: 'auto'
            },
            {
                width: finalRect.width,
                height: finalRect.height,
                minHeight: finalRect.height,
                duration: .42,
                ease: 'power3.inOut',
                clearProps:
                    'width,height,minHeight,aspectRatio'
            }
        );

        const animatedContent =
            compact
                ? [
                    suburbiaPlayer
                        .querySelector(
                            '.suburbia-player-info'
                        ),
                    suburbiaPlayerViewToggle
                ]
                : [
                    suburbiaPlayer
                        .querySelector(
                            '.suburbia-player-cover'
                        ),
                    suburbiaPlayer
                        .querySelector(
                            '.suburbia-player-info'
                        ),
                    suburbiaPlayerViewToggle
                ];

        gsap.fromTo(
            animatedContent,
            {
                opacity: .25,
                y: compact ? 5 : -5
            },
            {
                opacity: 1,
                y: 0,
                duration: .3,
                delay: .08,
                ease: 'power2.out',
                clearProps: 'opacity,transform'
            }
        );
    }
);


function updateSuburbiaPlayState() {

    if (
        !suburbiaAudio ||
        !suburbiaPlayerIcon ||
        !suburbiaPlayerToggle
    ) {
        return;
    }

    const playing =
        !suburbiaAudio.paused &&
        !suburbiaAudio.ended;

    suburbiaPlayerToggle.setAttribute(
        'aria-label',
        playing
            ?
            'Pausar música'
            :
            'Reproducir música'
    );

    suburbiaPlayerToggle.setAttribute(
        'aria-pressed',
        String(playing)
    );
}


function showSuburbiaPlayer() {

    if (!suburbiaPlayer) {
        return;
    }

    suburbiaPlayer.setAttribute(
        'aria-hidden',
        'false'
    );

    if (
        window.gsap &&
        !window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
    ) {

        gsap.killTweensOf(
            suburbiaPlayer
        );

        gsap.to(
            suburbiaPlayer,
            {
                autoAlpha: 1,
                y: 0,
                duration: .55,
                ease: 'power3.out'
            }
        );

        return;
    }

    suburbiaPlayer.style.visibility =
        'visible';

    suburbiaPlayer.style.opacity =
        '1';

    suburbiaPlayer.style.transform =
        'none';
}


function hideSuburbiaPlayerOnMobile() {

    if (
        !suburbiaPlayer ||
        !window.matchMedia(
            '(max-width: 1160px)'
        ).matches
    ) {
        return;
    }

    suburbiaPlayer.setAttribute(
        'aria-hidden',
        'true'
    );

    if (
        window.gsap &&
        !window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
    ) {
        gsap.killTweensOf(
            suburbiaPlayer
        );

        gsap.to(
            suburbiaPlayer,
            {
                autoAlpha: 0,
                y: 20,
                duration: .35,
                ease: 'power2.in'
            }
        );

        return;
    }

    suburbiaPlayer.style.visibility =
        'hidden';

    suburbiaPlayer.style.opacity =
        '0';

    suburbiaPlayer.style.transform =
        'translateY(20px)';
}


function closeSuburbiaIntro() {

    if (!suburbiaIntro) {
        return;
    }

    document.body.classList.remove(
        'intro-active'
    );

    if (
        window.gsap &&
        !window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
    ) {

        const timeline =
            gsap.timeline({
                onComplete: () => {
                    suburbiaIntro.remove();
                }
            });

        timeline
            .to(
                [
                    suburbiaIntroEnter,
                    suburbiaIntroLabel
                ],
                {
                    opacity: 0,
                    y: -12,
                    duration: .25,
                    ease: 'power2.in'
                },
                0
            )
            .to(
                suburbiaIntroLogo,
                {
                    opacity: 0,
                    scale: 1.08,
                    filter:
                        'blur(5px) brightness(1.35)',
                    duration: .42,
                    ease: 'power2.in'
                },
                .04
            )
            .to(
                suburbiaIntro,
                {
                    opacity: 0,
                    duration: .48,
                    ease: 'power2.inOut'
                },
                .24
            );

        return;
    }

    suburbiaIntro.remove();
}


async function enterSuburbia() {

    sessionStorage.setItem(
        'suburbiaIntroSeen',
        'true'
    );

    if (
        !suburbiaAudio ||
        !suburbiaIntroEnter
    ) {
        closeSuburbiaIntro();
        return;
    }

    suburbiaIntroEnter.disabled =
        true;

    try {

        suburbiaAudio.currentTime =
            0;

        await suburbiaAudio.play();

        updateSuburbiaPlayState();

    } catch (error) {

        console.warn(
            'No se pudo iniciar el audio:',
            error
        );

    }

    showSuburbiaPlayer();

    closeSuburbiaIntro();
}


function setupSuburbiaIntro() {

    if (
        !suburbiaIntro ||
        !suburbiaIntroEnter
    ) {
        return;
    }

    document.body.classList.add(
        'intro-active'
    );

    const prefersReducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

    if (
        window.gsap &&
        !prefersReducedMotion
    ) {

        gsap.set(
            suburbiaIntroEnter,
            {
                autoAlpha: 0,
                y: 16
            }
        );

        const introTimeline =
            gsap.timeline();

        introTimeline
            .to(
                suburbiaIntroLogo,
                {
                    opacity: 1,
                    scale: 1,
                    filter:
                        'blur(0px) brightness(1)',
                    duration: 1.15,
                    ease: 'power3.out'
                },
                .35
            )
            .to(
                suburbiaIntroLabel,
                {
                    opacity: 1,
                    y: 0,
                    duration: .7,
                    ease: 'power2.out'
                },
                1.05
            )
            .to(
                suburbiaIntroEnter,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: .65,
                    ease: 'power3.out'
                },
                1.5
            );

    } else {

        suburbiaIntroLogo.style.opacity =
            '1';

        suburbiaIntroLogo.style.filter =
            'none';

        suburbiaIntroLogo.style.transform =
            'none';

        suburbiaIntroLabel.style.opacity =
            '1';

        suburbiaIntroLabel.style.transform =
            'none';

        suburbiaIntroEnter.style.visibility =
            'visible';

        suburbiaIntroEnter.style.opacity =
            '1';

        suburbiaIntroEnter.style.transform =
            'none';
    }

    suburbiaIntroEnter.addEventListener(
        'click',
        enterSuburbia
    );
}


async function toggleSuburbiaAudio() {

    if (!suburbiaAudio) {
        return;
    }

    if (
        suburbiaAudio.paused ||
        suburbiaAudio.ended
    ) {

        if (suburbiaAudio.ended) {
            suburbiaAudio.currentTime =
                0;
        }

        try {
            await suburbiaAudio.play();
            showSuburbiaPlayer();
        } catch (error) {
            console.warn(
                'No se pudo reproducir el audio:',
                error
            );
        }

    } else {

        suburbiaAudio.pause();
    }

    updateSuburbiaPlayState();
}


suburbiaPlayerToggle?.addEventListener(
    'click',
    toggleSuburbiaAudio
);

document.addEventListener(
    'suburbia:toggle-audio',
    toggleSuburbiaAudio
);


suburbiaPlayerProgress?.addEventListener(
    'click',
    event => {

        if (
            !suburbiaAudio ||
            !Number.isFinite(
                suburbiaAudio.duration
            )
        ) {
            return;
        }

        const rect =
            suburbiaPlayerProgress
                .getBoundingClientRect();

        const position =
            Math.max(
                0,
                Math.min(
                    1,
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width
                )
            );

        suburbiaAudio.currentTime =
            suburbiaAudio.duration *
            position;

        updateSuburbiaPlayer();
    }
);


suburbiaAudio?.addEventListener(
    'timeupdate',
    updateSuburbiaPlayer
);

suburbiaAudio?.addEventListener(
    'loadedmetadata',
    updateSuburbiaPlayer
);

suburbiaAudio?.addEventListener(
    'play',
    updateSuburbiaPlayState
);

suburbiaAudio?.addEventListener(
    'pause',
    updateSuburbiaPlayState
);

suburbiaAudio?.addEventListener(
    'ended',
    () => {

        updateSuburbiaPlayState();
        hideSuburbiaPlayerOnMobile();

        if (
            suburbiaPlayerProgressFill
        ) {
            suburbiaPlayerProgressFill
                .style.width =
                '100%';
        }
    }
);


const introAlreadySeen =
    sessionStorage.getItem(
        'suburbiaIntroSeen'
    ) === 'true';

if (introAlreadySeen) {

    suburbiaIntro?.remove();

    document.body.classList.remove(
        'intro-active'
    );

    if (
        window.matchMedia(
            '(min-width: 1161px)'
        ).matches
    ) {
        window.requestAnimationFrame(
            () => {
                showSuburbiaPlayer();
                updateSuburbiaPlayState();
                updateSuburbiaPlayer();
            }
        );
    }

} else {

    setupSuburbiaIntro();
}

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
    const grid =
        document.getElementById(
            'schedule-grid'
        );

    if (!grid) return;

    try {
        const response =
            await fetch(
                '/api/horarios',
                {
                    cache: 'no-store'
                }
            );

        if (!response.ok) {
            throw new Error(
                'No se pudieron cargar los horarios.'
            );
        }

        const schedule =
            await response.json();

        if (!Array.isArray(schedule)) {
            throw new Error(
                'El formato de horarios no es válido.'
            );
        }

        const dayOrder = [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ];

        const groupedSchedule =
            schedule.reduce(
                (groups, item) => {

                    if (!groups.has(item.dia)) {
                        groups.set(
                            item.dia,
                            []
                        );
                    }

                    groups
                        .get(item.dia)
                        .push(item);

                    return groups;
                },
                new Map()
            );

        grid.replaceChildren();

        dayOrder.forEach(day => {
            const classes =
                groupedSchedule.get(day);

            if (!classes?.length) {
                return;
            }

            const column =
                document.createElement(
                    'section'
                );

            column.className =
                'schedule-day';

            const heading =
                document.createElement(
                    'h4'
                );

            heading.textContent =
                day;

            column.append(
                heading
            );

            classes
                .sort(
                    (first, second) =>
                        first.hora_inicio
                            .localeCompare(
                                second.hora_inicio
                            )
                )
                .forEach(item => {

                    const classBlock =
                        document.createElement(
                            'div'
                        );

                    classBlock.className =
                        'schedule-slot';

                    const time =
                        document.createElement(
                            'time'
                        );

                    time.textContent =
                        `${item.hora_inicio}–${item.hora_fin}`;

                    const dt =
                        document.createElement(
                            'strong'
                        );

                    dt.textContent =
                        item.DT || '';

                    classBlock.append(
                        time,
                        dt
                    );

                    column.append(
                        classBlock
                    );
                });

            grid.append(
                column
            );
        });

        if (!grid.children.length) {
            throw new Error(
                'Todavía no hay horarios disponibles.'
            );
        }

    } catch (error) {

        console.error(
            'No se pudo cargar la grilla de horarios:',
            error
        );

        const fallback =
            document.createElement(
                'div'
            );

        fallback.className =
            'schedule-fallback';

        const message =
            document.createElement(
                'p'
            );

        message.textContent =
            'Consultanos la grilla semanal actualizada.';

        const contactLink =
            document.createElement(
                'a'
            );

        contactLink.href =
            'https://chat.whatsapp.com/DYA2gbptJUC7cyC4Wrayjm';

        contactLink.target =
            '_blank';

        contactLink.rel =
            'noopener noreferrer';

        contactLink.textContent =
            'Consultar horarios →';

        fallback.append(
            message,
            contactLink
        );

        grid.replaceChildren(
            fallback
        );
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
/* =========================================================
   SCROLL SEQUENCE - FRAMES 020 A 144
   ========================================================= */

    const sequenceSection =
        document.querySelector(
            '.scroll-sequence'
        );

    const sequenceCanvas =
        document.querySelector(
            '.sequence-canvas'
        );

    const sequenceContent =
        document.querySelector(
            '.sequence-content'
        );

    const sequenceShade =
        document.querySelector(
            '.sequence-shade'
        );


    if (
        sequenceSection &&
        sequenceCanvas &&
        !reduceMotion
    ) {

        const context =
            sequenceCanvas.getContext(
                '2d'
            );

        /* =====================================================
        CONFIGURACIÓN
        ===================================================== */

        const firstFrameNumber = 20;
        const lastFrameNumber = 144;
        const frameCount =
            lastFrameNumber - firstFrameNumber + 1;

        /*
        * Cuánto tarda la imagen en alcanzar
        * el frame pedido por el scroll.
        *
        * Más bajo = más cinematográfico / suave.
        * Más alto = más directo.
        *
        * 0.12 - 0.18 es una buena zona.
        */
        const smoothing = 0.14;

        /*
        * La secuencia completa termina al 62%
        * del recorrido de la sección.
        *
        * Dejamos el resto para revelar y leer
        * el contenido, igual que antes.
        */
        const sequenceEnd = 0.62;

        const revealStart = 0.50;
        const revealDuration = 0.10;


        /* =====================================================
        ESTADO
        ===================================================== */

        const frames =
            Array(frameCount);

        let targetFrame = 0;
        let smoothFrame = 0;
        let renderedFrame = -1;

        let sequenceProgress = 0;

        let lastImpactState = false;

        let animationFrameId = null;
        let sequenceIsVisible = false;


        /* =====================================================
        FRAMES
        ===================================================== */

        const framePath =
            index =>
                `assets/frames-boxeo-144/frame-${String(
                    index + firstFrameNumber
                ).padStart(
                    3,
                    '0'
                )}.jpg`;


        function drawFrame(index) {

            const image =
                frames[index];

            if (
                !image?.complete ||
                !image.naturalWidth
            ) {
                return;
            }

            context.clearRect(
                0,
                0,
                sequenceCanvas.width,
                sequenceCanvas.height
            );

            const canvasRatio =
                sequenceCanvas.width /
                sequenceCanvas.height;

            const imageRatio =
                image.naturalWidth /
                image.naturalHeight;

            let sourceWidth =
                image.naturalWidth;

            let sourceHeight =
                image.naturalHeight;

            let sourceX = 0;
            let sourceY = 0;


            if (
                imageRatio >
                canvasRatio
            ) {

                sourceWidth =
                    image.naturalHeight *
                    canvasRatio;

                sourceX =
                    (
                        image.naturalWidth -
                        sourceWidth
                    ) / 2;

            } else {

                sourceHeight =
                    image.naturalWidth /
                    canvasRatio;

                sourceY =
                    (
                        image.naturalHeight -
                        sourceHeight
                    ) / 2;
            }


            context.drawImage(
                image,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                sequenceCanvas.width,
                sequenceCanvas.height
            );
        }


        function loadFrame(index) {

            if (
                index < 0 ||
                index >= frameCount ||
                frames[index]
            ) {
                return;
            }

            const image =
                new Image();

            frames[index] =
                image;

            image.decoding =
                'async';

            image.src =
                framePath(index);


            image.addEventListener(
                'load',
                () => {

                    /*
                    * Si justo estamos esperando este frame,
                    * lo mostramos apenas termina de cargar.
                    */

                    if (
                        index ===
                        renderedFrame
                    ) {
                        drawFrame(
                            index
                        );
                    }

                },
                {
                    once: true
                }
            );
        }


        /* =====================================================
        PRECARGA INTELIGENTE
        ===================================================== */

        function preloadAround(index) {

            /*
            * Mantenemos cargados varios frames
            * alrededor del frame hacia el que
            * nos estamos moviendo.
            */

            const radius = 10;

            for (
                let offset = -radius;
                offset <= radius;
                offset += 1
            ) {

                loadFrame(
                    index + offset
                );
            }
        }


        /* =====================================================
        CANVAS
        ===================================================== */

        function resizeSequence() {

            const pixelRatio =
                Math.min(
                    window.devicePixelRatio ||
                    1,
                    2
                );

            sequenceCanvas.width =
                Math.round(
                    window.innerWidth *
                    pixelRatio
                );

            sequenceCanvas.height =
                Math.round(
                    window.innerHeight *
                    pixelRatio
                );


            if (
                renderedFrame >= 0
            ) {
                drawFrame(
                    renderedFrame
                );
            }
        }


        /* =====================================================
        PROGRESO DEL SCROLL
        ===================================================== */

        function calculateSequenceProgress() {

            const rect =
                sequenceSection
                    .getBoundingClientRect();

            const scrollDistance =
                sequenceSection.offsetHeight -
                window.innerHeight;


            if (
                scrollDistance <= 0
            ) {
                sequenceProgress = 0;
                return;
            }


            sequenceProgress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        -rect.top /
                        scrollDistance
                    )
                );


            /*
            * Los 144 frames recorren solamente
            * la primera parte de la sección.
            */

            const frameProgress =
                Math.min(
                    sequenceProgress /
                    sequenceEnd,
                    1
                );


            targetFrame =
                frameProgress *
                (
                    frameCount -
                    1
                );


            preloadAround(
                Math.round(
                    targetFrame
                )
            );


            /* =================================================
            REVEAL DEL CTA
            ================================================= */

            const revealProgress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (
                            sequenceProgress -
                            revealStart
                        ) /
                        revealDuration
                    )
                );


            if (sequenceShade) {

                sequenceShade
                    .style.opacity =
                    String(
                        revealProgress *
                        .72
                    );
            }


            if (sequenceContent) {

                sequenceContent
                    .style.opacity =
                    String(
                        revealProgress
                    );

                sequenceContent
                    .style.transform =
                    `translateY(${
                        (
                            1 -
                            revealProgress
                        ) *
                        34
                    }px)`;

                sequenceContent
                    .style.pointerEvents =
                    revealProgress >
                    .9
                        ?
                        'auto'
                        :
                        'none';
            }
        }


        /* =====================================================
        IMPACTO
        ===================================================== */

        function updateImpact(
            frame
        ) {

            /*
            * IMPORTANTE:
            *
            * Estos valores son provisionales.
            *
            * Los viejos frames 14–18 sobre 48
            * equivaldrían aproximadamente a
            * 42–54 sobre 144.
            *
            * Después de verlo funcionando
            * podemos poner el impacto EXACTAMENTE
            * donde ocurre el golpe en los nuevos
            * frames.
            */

            const impactStart =
                42 - firstFrameNumber;
            const impactEnd =
                54 - firstFrameNumber;


            const isImpact =
                frame >=
                    impactStart &&
                frame <=
                    impactEnd;


            if (
                isImpact &&
                !lastImpactState
            ) {

                sequenceCanvas
                    .classList
                    .remove(
                        'sequence-impact'
                    );

                /*
                * Fuerza reflow para reiniciar
                * la animación CSS.
                */
                void sequenceCanvas
                    .offsetWidth;

                sequenceCanvas
                    .classList
                    .add(
                        'sequence-impact'
                    );
            }


            lastImpactState =
                isImpact;
        }


        /* =====================================================
        MOTOR DE ANIMACIÓN
        ===================================================== */

        function animateSequence() {

            if (!sequenceIsVisible) {
                animationFrameId = null;
                return;
            }

            /*
            * En vez de saltar directamente al
            * frame que pide el scroll:
            *
            * scroll
            *   ↓
            * targetFrame
            *   ↓
            * smoothFrame
            *   ↓
            * frame visible
            *
            * Esto elimina buena parte de la
            * sensación "tosca".
            */

            const difference =
                targetFrame -
                smoothFrame;


            if (
                Math.abs(
                    difference
                ) < .01
            ) {

                smoothFrame =
                    targetFrame;

            } else {

                smoothFrame +=
                    difference *
                    smoothing;
            }


            const nextFrame =
                Math.max(
                    0,
                    Math.min(
                        frameCount - 1,
                        Math.round(
                            smoothFrame
                        )
                    )
                );


            if (
                nextFrame !==
                renderedFrame
            ) {

                loadFrame(
                    nextFrame
                );

                /*
                * Precargamos también los frames
                * inmediatamente siguientes.
                */

                loadFrame(
                    nextFrame + 1
                );

                loadFrame(
                    nextFrame + 2
                );

                loadFrame(
                    nextFrame - 1
                );


                renderedFrame =
                    nextFrame;


                drawFrame(
                    renderedFrame
                );


                updateImpact(
                    renderedFrame
                );
            }


            animationFrameId =
                window.requestAnimationFrame(
                    animateSequence
                );
        }


        function startSequenceAnimation() {

            if (
                sequenceIsVisible &&
                animationFrameId === null
            ) {
                animationFrameId =
                    window.requestAnimationFrame(
                        animateSequence
                    );
            }
        }


        function stopSequenceAnimation() {

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(
                    animationFrameId
                );

                animationFrameId = null;
            }
        }


        /* =====================================================
        EVENTOS
        ===================================================== */

        function handleSequenceScroll() {

            if (sequenceIsVisible) {
                calculateSequenceProgress();
            }
        }


        function handleSequenceResize() {

            resizeSequence();

            calculateSequenceProgress();
        }


        /* =====================================================
        INICIALIZACIÓN
        ===================================================== */

        loadFrame(
            0
        );

        loadFrame(
            frameCount - 1
        );


        /*
        * Los primeros frames se cargan
        * inmediatamente para evitar que el
        * usuario llegue a la secuencia antes
        * que las imágenes.
        */

        for (
            let index = 0;
            index < 18;
            index += 1
        ) {

            loadFrame(
                index
            );
        }


        resizeSequence();

        calculateSequenceProgress();


        window.addEventListener(
            'resize',
            handleSequenceResize,
            {
                passive: true
            }
        );


        window.addEventListener(
            'scroll',
            handleSequenceScroll,
            {
                passive: true
            }
        );


        if ('IntersectionObserver' in window) {

            const sequenceObserver =
                new IntersectionObserver(
                    entries => {

                        sequenceIsVisible =
                            entries[0]
                                ?.isIntersecting === true;

                        if (sequenceIsVisible) {
                            calculateSequenceProgress();
                            startSequenceAnimation();
                        } else {
                            stopSequenceAnimation();
                        }
                    },
                    {
                        threshold: 0
                    }
                );

            sequenceObserver.observe(
                sequenceSection
            );

        } else {

            sequenceIsVisible = true;
            startSequenceAnimation();
        }


        document.addEventListener(
            'visibilitychange',
            () => {

                if (document.hidden) {
                    stopSequenceAnimation();
                    return;
                }

                startSequenceAnimation();
            }
        );
    }
