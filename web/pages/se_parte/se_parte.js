let selectedType = '';

let selectedButton = null;

let isTransitioning = false;



/* =========================================================
   CONTENIDO
   ========================================================= */

const content = {

    experiencia: {

        kicker:
            'YA TENÉS EXPERIENCIA',

        title:
            'CONOCÉ CÓMO ENTRENAMOS.',

        description:
            'Micky te explica cómo hacemos la adaptación técnica antes de que te sumes al grupo.',

        conversion:
            'Unite a la comunidad y coordiná tu clase de reacondicionamiento técnico.',

        video:
            'assets/videos/experiencia-web.mp4'

    },


    iniciacion: {

        kicker:
            'EMPEZÁS DE CERO',

        title:
            'TE ACOMPAÑAMOS DESDE EL PRINCIPIO.',

        description:
            'Micky te cuenta cómo es la primera clase y por qué no necesitás experiencia para arrancar.',

        conversion:
            'Unite a la comunidad y coordiná tu clase inicial de acondicionamiento técnico.',

        video:
            'assets/videos/iniciacion-web.mp4'

    }

};



/* =========================================================
   ELEMENTOS
   ========================================================= */

const modal =
    document.getElementById(
        'video-modal'
    );


const modalPanel =
    document.querySelector(
        '.modal-panel'
    );


const closeButton =
    document.querySelector(
        '.modal-close'
    );


const optionButtons =
    Array.from(
        document.querySelectorAll(
            '.experience-card'
        )
    );


const watchButton =
    document.querySelector(
        '.watch-button'
    );


const stages =
    Array.from(
        document.querySelectorAll(
            '.modal-stage'
        )
    );


const progressBars =
    Array.from(
        document.querySelectorAll(
            '.modal-progress span'
        )
    );


const status =
    document.querySelector(
        '.video-status'
    );


const experienceVideo =
    document.getElementById(
        'experience-video'
    );


const videoStage =
    document.querySelector(
        '.video-stage'
    );


const conversionStage =
    document.querySelector(
        '.conversion-stage'
    );



/* =========================================================
   STAGES
   ========================================================= */

function showStage(index) {

    stages.forEach(
        (
            stage,
            stageIndex
        ) => {

            stage.classList.toggle(
                'active',
                stageIndex === index
            );

        }
    );


    progressBars.forEach(
        (
            bar,
            barIndex
        ) => {

            bar.classList.toggle(
                'active',
                barIndex <= index
            );

        }
    );

}



/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    message = ''
) {

    if (!status) {
        return;
    }


    status.textContent =
        message;

}



/* =========================================================
   PREPARAR VIDEO
   ========================================================= */

function prepareVideo(type) {

    const selected =
        content[type];


    if (
        !selected ||
        !experienceVideo
    ) {
        return;
    }


    experienceVideo.pause();


    experienceVideo.src =
        selected.video;


    experienceVideo.load();

}



/* =========================================================
   ABRIR MODAL
   ========================================================= */

function openModal(
    type,
    button
) {

    const selected =
        content[type];


    if (
        !selected ||
        !modal
    ) {
        return;
    }


    selectedType =
        type;


    selectedButton =
        button;


    isTransitioning =
        false;


    document
        .getElementById(
            'modal-kicker'
        )
        .textContent =
            selected.kicker;


    document
        .getElementById(
            'modal-title'
        )
        .textContent =
            selected.title;


    document
        .getElementById(
            'modal-description'
        )
        .textContent =
            selected.description;


    document
        .getElementById(
            'conversion-copy'
        )
        .textContent =
            selected.conversion;


    prepareVideo(
        type
    );


    setStatus();


    showStage(
        0
    );


    if (
        typeof gsap !==
        'undefined'
    ) {

        gsap.killTweensOf(
            [
                modal,
                modalPanel,
                ...stages
            ]
        );


        gsap.set(
            stages,
            {
                clearProps:
                    'opacity,transform'
            }
        );

    }


    modal
        .classList
        .add(
            'open'
        );


    modal
        .setAttribute(
            'aria-hidden',
            'false'
        );


    document.body.style.overflow =
        'hidden';


    if (
        typeof gsap !==
        'undefined'
    ) {

        gsap.fromTo(
            modal,

            {
                opacity: 0
            },

            {
                opacity: 1,

                duration: .25,

                ease:
                    'power2.out'
            }
        );


        gsap.fromTo(
            modalPanel,

            {
                opacity: 0,

                scale: .97,

                y: 12
            },

            {
                opacity: 1,

                scale: 1,

                y: 0,

                duration: .45,

                ease:
                    'power3.out'
            }
        );

    }


    closeButton
        ?.focus();

}



/* =========================================================
   CERRAR MODAL
   ========================================================= */

function closeModal() {

    if (
        !modal ||
        isTransitioning
    ) {
        return;
    }


    if (
        experienceVideo
    ) {

        experienceVideo.pause();


        try {

            experienceVideo.currentTime =
                0;

        } catch {
            // nada
        }

    }


    const finishClose =
        () => {

            modal
                .classList
                .remove(
                    'open'
                );


            modal
                .setAttribute(
                    'aria-hidden',
                    'true'
                );


            document.body.style.overflow =
                '';


            setStatus();


            showStage(
                0
            );


            if (
                typeof gsap !==
                'undefined'
            ) {

                gsap.set(
                    [
                        modal,
                        modalPanel,
                        ...stages
                    ],
                    {
                        clearProps:
                            'opacity,transform'
                    }
                );

            }


            selectedButton
                ?.focus();

        };


    if (
        typeof gsap ===
        'undefined'
    ) {

        finishClose();

        return;

    }


    gsap.to(
        modalPanel,

        {
            opacity: 0,

            scale: .98,

            duration: .22,

            ease:
                'power2.in'
        }
    );


    gsap.to(
        modal,

        {
            opacity: 0,

            duration: .25,

            ease:
                'power2.in',

            onComplete:
                finishClose
        }
    );

}



/* =========================================================
   TRANSICIÓN VIDEO -> CONVERSIÓN
   ========================================================= */

function transitionToConversion() {

    if (
        isTransitioning ||
        !videoStage ||
        !conversionStage
    ) {

        showStage(
            2
        );

        return;

    }


    isTransitioning =
        true;


    setStatus();


    if (
        typeof gsap ===
        'undefined'
    ) {

        showStage(
            2
        );


        isTransitioning =
            false;


        return;

    }


    const conversionElements = [

        conversionStage
            .querySelector(
                '.success-mark'
            ),

        conversionStage
            .querySelector(
                '.modal-kicker'
            ),

        conversionStage
            .querySelector(
                'h2'
            ),

        conversionStage
            .querySelector(
                '#conversion-copy'
            ),

        conversionStage
            .querySelector(
                '.whatsapp-button'
            ),

        conversionStage
            .querySelector(
                '.coordinator-link'
            )

    ].filter(Boolean);


    gsap.killTweensOf(
        [
            videoStage,
            conversionStage,
            ...conversionElements
        ]
    );


    const tl =
        gsap.timeline({

            defaults: {
                overwrite:
                    'auto'
            }

        });



    /*
        Sale el video
    */

    tl.to(
        videoStage,

        {
            opacity: 0,

            scale: .96,

            y: -26,

            duration: .48,

            ease:
                'power2.in'
        }
    );



    /*
        Cambio real de stage
    */

    tl.call(
        () => {

            showStage(
                2
            );


            gsap.set(
                conversionStage,

                {
                    opacity: 1,

                    scale: .97,

                    y: 10
                }
            );


            gsap.set(
                conversionElements,

                {
                    opacity: 0,

                    y: 25
                }
            );

        }
    );



    /*
        Entra la pantalla final
    */

    tl.to(
        conversionStage,

        {
            scale: 1,

            y: 0,

            duration: .45,

            ease:
                'power3.out'
        }
    );



    /*
        Entran los elementos uno detrás de otro
    */

    tl.to(
        conversionElements,

        {
            opacity: 1,

            y: 0,

            duration: .5,

            stagger: .075,

            ease:
                'power3.out'
        },

        '-=.28'
    );



    /*
        Dejamos todo preparado
        para una futura reapertura
    */

    tl.call(
        () => {

            gsap.set(
                videoStage,

                {
                    clearProps:
                        'opacity,transform'
                }
            );


            gsap.set(
                conversionStage,

                {
                    clearProps:
                        'opacity,transform'
                }
            );


            gsap.set(
                conversionElements,

                {
                    clearProps:
                        'opacity,transform'
                }
            );


            isTransitioning =
                false;

        }
    );

}



/* =========================================================
   CLICK OPCIONES
   ========================================================= */

optionButtons.forEach(
    button => {

        button.addEventListener(
            'click',

            () => {

                openModal(
                    button.dataset.type,
                    button
                );

            }
        );

    }
);



/* =========================================================
   BOTÓN ESCUCHAR AL PROFE
   ========================================================= */

watchButton
    ?.addEventListener(
        'click',

        async () => {

            if (
                !selectedType ||
                !experienceVideo
            ) {
                return;
            }


            showStage(
                1
            );


            setStatus(
                'Cargando el video…'
            );


            const selected =
                content[
                    selectedType
                ];


            if (
                !experienceVideo
                    .getAttribute(
                        'src'
                    )
                ||
                !experienceVideo
                    .getAttribute(
                        'src'
                    )
                    .includes(
                        selected.video
                    )
            ) {

                prepareVideo(
                    selectedType
                );

            }


            if (
                typeof gsap !==
                'undefined'
            ) {

                gsap.fromTo(
                    videoStage,

                    {
                        opacity: 0,

                        y: 25,

                        scale: .97
                    },

                    {
                        opacity: 1,

                        y: 0,

                        scale: 1,

                        duration: .5,

                        ease:
                            'power3.out'
                    }
                );

            }


            try {

                await experienceVideo.play();


                setStatus();

            } catch (
                error
            ) {

                console.error(
                    'No se pudo reproducir el video:',
                    error
                );


                setStatus(
                    'Tocá play para reproducir el video.'
                );

            }

        }
    );



/* =========================================================
   VIDEO TERMINADO
   ========================================================= */

experienceVideo
    ?.addEventListener(
        'ended',

        () => {

            transitionToConversion();

        }
    );



/* =========================================================
   ERROR VIDEO
   ========================================================= */

experienceVideo
    ?.addEventListener(
        'error',

        () => {

            console.error(
                'Error cargando el video:',
                experienceVideo.error
            );


            setStatus(
                'No pudimos cargar el video. Revisá el archivo e intentá nuevamente.'
            );

        }
    );



/* =========================================================
   METADATA
   ========================================================= */

experienceVideo
    ?.addEventListener(
        'loadedmetadata',

        () => {

            setStatus();

        }
    );



/* =========================================================
   CERRAR
   ========================================================= */

closeButton
    ?.addEventListener(
        'click',
        closeModal
    );


modal
    ?.addEventListener(
        'click',

        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


document
    .addEventListener(
        'keydown',

        event => {

            if (
                event.key ===
                    'Escape'
                &&
                modal
                    ?.classList
                    .contains(
                        'open'
                    )
            ) {

                closeModal();

            }

        }
    );