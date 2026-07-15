const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sequenceSection = document.querySelector('.history-sequence');
const sequenceCanvas = document.querySelector('.history-sequence-canvas');
const sequenceContent = document.querySelector('.history-sequence-content');
const sequenceShade = document.querySelector('.history-sequence-shade');

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
