let player; // Variable global para el reproductor de YouTube

// 1. Cargamos la API de YouTube de forma asíncrona
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const config = {
    iniciacion: {
        videoId: "iRwEFkNwUI4", // SOLO el ID del video
        titulo: "¡EL PRIMER PASO ES EL MÁS FUERTE!",
        subtitulo: "Unite al grupo y coordiná tu clase de acondicionamiento técnico ahora."
    },
    experiencia: {
        videoId: "iRwEFkNwUI4", 
        titulo: "¡EL EQUIPO TE ESPERA!",
        subtitulo: "Unite al grupo y coordiná tu clase de reacondicionamiento técnico ahora."
    }
};

let currentType = "";

// 2. Esta función la llama YouTube automáticamente cuando la API está lista
window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('youtube-audio-player', {
        height: '100%',
        width: '100%',
        videoId: '', // Empieza vacío
        playerVars: {
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
};

// 3. Detectar cuando el video termina
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        document.getElementById('player-container').style.display = "none";
        const plate = document.getElementById('conversion-plate');
        plate.style.display = "flex";
        
        document.getElementById('conversion-title').innerText = config[currentType].titulo;
        document.getElementById('conversion-text').innerText = config[currentType].subtitulo;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('video-modal');
    const preScreen = document.getElementById('pre-video-screen');
    const plate = document.getElementById('conversion-plate');

    function abrirModal(tipo) {
        currentType = tipo;
        document.body.style.overflow = 'hidden'; 
        modal.style.display = 'flex';
        preScreen.style.display = 'flex';
        plate.style.display = 'none';
        document.getElementById('player-container').style.display = "none";
    }

    document.querySelector('.btn-experiencia').onclick = (e) => { e.preventDefault(); abrirModal('experiencia'); };
    document.querySelector('.btn-iniciacion').onclick = (e) => { e.preventDefault(); abrirModal('iniciacion'); };

    document.getElementById('start-video-btn').onclick = () => {
        preScreen.style.display = "none";
        document.getElementById('player-container').style.display = "block";
        
        // Cargamos y reproducimos el video por ID
        player.loadVideoById(config[currentType].videoId);
        player.playVideo();
    };

    window.cerrarModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        player.stopVideo();
        plate.style.display = "none";
    };

    document.querySelector('.close-btn').onclick = window.cerrarModal;
    window.onclick = (event) => { if (event.target == modal) window.cerrarModal(); };
});