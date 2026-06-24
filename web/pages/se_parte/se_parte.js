let player;
let playerReady = false;
let selectedType = '';

const content = {
    experiencia: {
        kicker: 'YA TENÉS EXPERIENCIA',
        title: 'CONOCÉ CÓMO ENTRENAMOS.',
        description: 'Micky te explica cómo hacemos la adaptación técnica antes de que te sumes al grupo.',
        conversion: 'Unite a la comunidad y coordiná tu clase de reacondicionamiento técnico.',
        videoId: 'iRwEFkNwUI4'
    },
    iniciacion: {
        kicker: 'EMPEZÁS DE CERO',
        title: 'TE ACOMPAÑAMOS DESDE EL PRINCIPIO.',
        description: 'Micky te cuenta cómo es la primera clase y por qué no necesitás experiencia para arrancar.',
        conversion: 'Unite a la comunidad y coordiná tu clase inicial de acondicionamiento técnico.',
        videoId: 'iRwEFkNwUI4'
    }
};

const youtubeScript = document.createElement('script');
youtubeScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(youtubeScript);

window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('youtube-player', {
        width: '100%',
        height: '100%',
        videoId: '',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
            onReady: () => { playerReady = true; },
            onStateChange: event => {
                if (event.data === YT.PlayerState.ENDED) showStage(2);
            },
            onError: () => setStatus('No pudimos cargar el video. Cerrá el modal e intentá nuevamente.')
        }
    });
};

const modal = document.getElementById('video-modal');
const closeButton = document.querySelector('.modal-close');
const optionButtons = Array.from(document.querySelectorAll('.experience-card'));
const watchButton = document.querySelector('.watch-button');
const stages = Array.from(document.querySelectorAll('.modal-stage'));
const progressBars = Array.from(document.querySelectorAll('.modal-progress span'));
const status = document.querySelector('.video-status');
let selectedButton;

function showStage(index) {
    stages.forEach((stage, stageIndex) => stage.classList.toggle('active', stageIndex === index));
    progressBars.forEach((bar, barIndex) => bar.classList.toggle('active', barIndex <= index));
}

function setStatus(message = '') {
    status.textContent = message;
}

function openModal(type, button) {
    selectedType = type;
    selectedButton = button;
    const selected = content[type];
    document.getElementById('modal-kicker').textContent = selected.kicker;
    document.getElementById('modal-title').textContent = selected.title;
    document.getElementById('modal-description').textContent = selected.description;
    document.getElementById('conversion-copy').textContent = selected.conversion;
    setStatus();
    showStage(0);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
}

function closeModal() {
    if (playerReady) player.stopVideo();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    selectedButton?.focus();
}

optionButtons.forEach(button => button.addEventListener('click', () => openModal(button.dataset.type, button)));

watchButton.addEventListener('click', () => {
    showStage(1);
    if (!playerReady) {
        setStatus('Cargando el video…');
        const waitForPlayer = window.setInterval(() => {
            if (!playerReady) return;
            window.clearInterval(waitForPlayer);
            setStatus();
            player.loadVideoById(content[selectedType].videoId);
        }, 200);
        window.setTimeout(() => {
            window.clearInterval(waitForPlayer);
            if (!playerReady) setStatus('El video está tardando más de lo esperado. Revisá tu conexión.');
        }, 8000);
        return;
    }
    player.loadVideoById(content[selectedType].videoId);
});

closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
