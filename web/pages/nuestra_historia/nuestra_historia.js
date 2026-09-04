const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

const sequenceSection = document.querySelector('.history-sequence');
const sequenceCanvas = document.querySelector('.history-sequence-canvas');
const sequenceContent = document.querySelector('.history-sequence-content');
const sequenceShade = document.querySelector('.history-sequence-shade');

const journeyCarousel = document.querySelector('.journey-carousel');


/* =========================================================
   DESKTOP - CARRUSEL HORIZONTAL
   ========================================================= */

if (journeyCarousel) {
    const journeyCards = [
        ...journeyCarousel.querySelectorAll('.journey-card')
    ];

    let journeyIndex = 0;
    let journeyLocked = false;

    function showJourneyCard(nextIndex, direction) {
        if (
            journeyLocked ||
            nextIndex < 0 ||
            nextIndex >= journeyCards.length ||
            nextIndex === journeyIndex
        ) {
            return;
        }

        journeyLocked = true;

        const currentCard = journeyCards[journeyIndex];
        const nextCard = journeyCards[nextIndex];

        const enterX = direction === 'next' ? 140 : -140;
        const exitX = direction === 'next' ? -140 : 140;

        if (reduceMotion || typeof gsap === 'undefined') {
            currentCard.classList.remove('is-active');
            nextCard.classList.add('is-active');

            journeyIndex = nextIndex;
            journeyLocked = false;

            return;
        }

        const nextBg = nextCard.querySelector('.journey-bg');
        const nextTop = nextCard.querySelector('.journey-top');
        const nextColumns = nextCard.querySelectorAll('.journey-column');

        nextCard.classList.add('is-active');

        gsap.killTweensOf([
            currentCard,
            nextCard,
            nextBg,
            nextTop,
            nextColumns
        ]);

        gsap.set(nextCard, {
            x: enterX,
            opacity: 0,
            zIndex: 3
        });

        gsap.set(currentCard, {
            x: 0,
            opacity: 1,
            zIndex: 2
        });

        gsap.set(nextBg, {
            scale: 1.10
        });

        gsap.set(nextTop, {
            y: 24,
            opacity: 0
        });

        gsap.set(nextColumns, {
            y: 22,
            opacity: 0
        });

        const timeline = gsap.timeline({
            defaults: {
                ease: 'power3.out'
            },

            onComplete: () => {
                currentCard.classList.remove('is-active');

                gsap.set(currentCard, {
                    clearProps: 'transform,opacity,zIndex'
                });

                gsap.set(nextCard, {
                    clearProps: 'transform,opacity,zIndex'
                });

                gsap.set(nextBg, {
                    clearProps: 'transform'
                });

                gsap.set(nextTop, {
                    clearProps: 'transform,opacity'
                });

                gsap.set(nextColumns, {
                    clearProps: 'transform,opacity'
                });

                journeyIndex = nextIndex;
                journeyLocked = false;
            }
        });

        timeline
            .to(
                currentCard,
                {
                    x: exitX,
                    opacity: 0,
                    duration: .55,
                    ease: 'power3.inOut'
                },
                0
            )

            .to(
                nextCard,
                {
                    x: 0,
                    opacity: 1,
                    duration: .55,
                    ease: 'power3.inOut'
                },
                0
            )

            .to(
                nextBg,
                {
                    scale: 1.055,
                    duration: .9,
                    ease: 'power2.out'
                },
                .08
            )

            .to(
                nextTop,
                {
                    y: 0,
                    opacity: 1,
                    duration: .48,
                    ease: 'power3.out'
                },
                .15
            )

            .to(
                nextColumns,
                {
                    y: 0,
                    opacity: 1,
                    duration: .45,
                    stagger: .07,
                    ease: 'power3.out'
                },
                .20
            );
    }

    journeyCarousel.addEventListener('click', event => {
        const nextButton = event.target.closest('.journey-edge-next');
        const prevButton = event.target.closest('.journey-edge-prev');

        if (nextButton) {
            showJourneyCard(journeyIndex + 1, 'next');
            return;
        }

        if (prevButton) {
            showJourneyCard(journeyIndex - 1, 'prev');
        }
    });
}


/* =========================================================
   MOBILE - CARDS POR SCROLL
   ========================================================= */

if (
    typeof gsap !== 'undefined' &&
    typeof ScrollTrigger !== 'undefined'
) {
    gsap.registerPlugin(ScrollTrigger);

    const mobileJourney = gsap.matchMedia();

    mobileJourney.add('(max-width: 768px)', () => {
        const section = document.querySelector('.founder-journey');
        const sectionHead = section?.querySelector('.founder-journey-head');
        const carousel = section?.querySelector('.journey-carousel');

        if (!section || !sectionHead || !carousel) return;

        const cards = gsap.utils.toArray(
            carousel.querySelectorAll('.journey-card')
        );

        if (cards.length < 2) return;


        /* =================================================
           ESTADO BASE MOBILE
           ================================================= */

        cards.forEach(card => {
            card.classList.remove('is-active');
        });

        gsap.set(sectionHead, {
            opacity: 1,
            y: 0
        });

        gsap.set(carousel, {
            y: 0
        });

        cards.forEach((card, index) => {
            gsap.set(card, {
                y: 0,
                scale: 1,
                opacity: index === 0 ? 1 : 0,
                visibility: 'visible',
                zIndex: cards.length - index,
                pointerEvents: 'none'
            });
        });


        /* =================================================
           TIMELINE GENERAL
           ================================================= */

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,

                pin: section,

                start: 'top top',

                end: '+=350%',

                scrub: .8,

                anticipatePin: 1,

                invalidateOnRefresh: true
            }
        });


        /* =================================================
           ESTACIÓN INICIAL
           TÍTULO + ROUND 01
           ================================================= */

        timeline.to({}, {
            duration: .75
        });


        /* =================================================
           DESAPARECE EL TÍTULO
           Y LA CARD SUBE
           ================================================= */

        timeline
            .to(
                sectionHead,
                {
                    y: -36,
                    opacity: 0,
                    duration: .75,
                    ease: 'none'
                }
            )

            .to(
                carousel,
                {
                    y: -82,
                    duration: .75,
                    ease: 'none'
                },
                '<'
            );


        /* =================================================
           ROUND 01 - ESTACIÓN
           ================================================= */

        timeline.to({}, {
            duration: 1.15
        });


        /* =================================================
           ROUND 01 -> ROUND 02
           ================================================= */

        timeline
            .to(
                cards[0],
                {
                    y: -80,
                    scale: .96,
                    opacity: 0,
                    duration: 1,
                    ease: 'none'
                }
            )

            .fromTo(
                cards[1],
                {
                    y: 65,
                    scale: .97,
                    opacity: 0
                },
                {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    duration: 1,
                    ease: 'none'
                },
                '<'
            );


        /* =================================================
           ROUND 02 - ESTACIÓN
           ================================================= */

        timeline.to({}, {
            duration: 1.4
        });


        /* =================================================
           ROUND 02 -> ROUND 03
           ================================================= */

        timeline
            .to(
                cards[1],
                {
                    y: -80,
                    scale: .96,
                    opacity: 0,
                    duration: 1,
                    ease: 'none'
                }
            )

            .fromTo(
                cards[2],
                {
                    y: 65,
                    scale: .97,
                    opacity: 0
                },
                {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    duration: 1,
                    ease: 'none'
                },
                '<'
            );


        /* =================================================
           ROUND 03 - ESTACIÓN FINAL
           ================================================= */

        timeline.to({}, {
            duration: 1.6
        });


        /* =================================================
           CLEANUP AL SALIR DE MOBILE
           ================================================= */

        return () => {
            gsap.set(sectionHead, {
                clearProps: 'transform,opacity'
            });

            gsap.set(carousel, {
                clearProps: 'transform'
            });

            cards.forEach((card, index) => {
                gsap.set(card, {
                    clearProps:
                        'transform,opacity,visibility,zIndex,pointerEvents'
                });

                card.classList.toggle(
                    'is-active',
                    index === 0
                );
            });
        };
    });
}


/* =========================================================
   HISTORY SEQUENCE
   ========================================================= */

if (sequenceSection && sequenceCanvas && !reduceMotion) {
    const context = sequenceCanvas.getContext('2d');

    const frameCount = 48;

    const frames = Array(frameCount);

    let currentFrame = 0;
    let lastImpactState = false;
    let ticking = false;


    const framePath = index =>
        `assets/frames-boxeo/frame-${String(index + 1).padStart(3, '0')}.jpg`;


    function drawFrame(index) {
        const image = frames[index];

        if (!image?.complete || !image.naturalWidth) {
            return;
        }

        const canvasRatio =
            sequenceCanvas.width /
            sequenceCanvas.height;

        const imageRatio =
            image.naturalWidth /
            image.naturalHeight;

        let sourceWidth = image.naturalWidth;
        let sourceHeight = image.naturalHeight;

        let sourceX = 0;
        let sourceY = 0;


        if (imageRatio > canvasRatio) {
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


        context.clearRect(
            0,
            0,
            sequenceCanvas.width,
            sequenceCanvas.height
        );


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
        if (frames[index]) {
            return;
        }

        const image = new Image();

        frames[index] = image;

        image.decoding = 'async';

        image.src =
            framePath(index);


        image.addEventListener(
            'load',
            () => {
                if (index === currentFrame) {
                    drawFrame(index);
                }
            },
            {
                once: true
            }
        );
    }


    function resizeSequence() {
        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
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


        drawFrame(currentFrame);
    }


    function updateSequence() {
        const rect =
            sequenceSection.getBoundingClientRect();


        const scrollDistance =
            sequenceSection.offsetHeight -
            window.innerHeight;


        const progress =
            Math.max(
                0,
                Math.min(
                    1,
                    -rect.top /
                    scrollDistance
                )
            );


        const frameProgress =
            Math.min(
                progress / .62,
                1
            );


        const nextFrame =
            Math.round(
                frameProgress *
                (frameCount - 1)
            );


        const revealProgress =
            Math.max(
                0,
                Math.min(
                    1,
                    (progress - .64) / .12
                )
            );


        if (nextFrame !== currentFrame) {
            currentFrame = nextFrame;

            loadFrame(currentFrame);

            drawFrame(currentFrame);
        }


        const isImpact =
            currentFrame >= 14 &&
            currentFrame <= 18;


        if (
            isImpact &&
            !lastImpactState
        ) {
            sequenceCanvas.classList.remove(
                'sequence-impact'
            );


            void sequenceCanvas.offsetWidth;


            sequenceCanvas.classList.add(
                'sequence-impact'
            );
        }


        lastImpactState =
            isImpact;


        sequenceShade.style.opacity =
            String(
                revealProgress *
                .72
            );


        sequenceContent.style.opacity =
            String(
                revealProgress
            );


        sequenceContent.style.transform =
            `translateY(${(1 - revealProgress) * 34}px)`;


        sequenceContent.style.pointerEvents =
            revealProgress > .9
                ? 'auto'
                : 'none';


        ticking = false;
    }


    function requestSequenceUpdate() {
        if (ticking) {
            return;
        }

        ticking = true;

        window.requestAnimationFrame(
            updateSequence
        );
    }


    loadFrame(0);

    loadFrame(
        frameCount - 1
    );


    resizeSequence();


    window.addEventListener(
        'resize',
        resizeSequence,
        {
            passive: true
        }
    );


    window.addEventListener(
        'scroll',
        requestSequenceUpdate,
        {
            passive: true
        }
    );


    updateSequence();


    const preloadFrames = () => {
        for (
            let index = 1;
            index < frameCount - 1;
            index += 1
        ) {
            loadFrame(index);
        }
    };


    if (
        'requestIdleCallback'
        in window
    ) {
        window.requestIdleCallback(
            preloadFrames,
            {
                timeout: 1800
            }
        );
    } else {
        window.setTimeout(
            preloadFrames,
            400
        );
    }
}