document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    const plate = document.getElementById('conversion-plate');
    const closeBtn = document.querySelector('.close-btn');
    
    // Elementos de la placa para cambiar textos
    const title = document.getElementById('conversion-title');
    const text = document.getElementById('conversion-text');

    let currentType = ""; 

    const config = {
        iniciacion: {
            video: "../../assets/video_iniciacion.mp4",
            titulo: "¡EL PRIMER PASO ES EL MÁS FUERTE!",
            subtitulo: "Unite al grupo y coordiná tu clase de acondicionamiento tecnico ahora."
        },
        experiencia: {
            video: "../../assets/video_iniciacion.mp4",
            titulo: "¡EL EQUIPO TE ESPERA!",
            subtitulo: "Unite al grupo y coordiná tu clase de reacondicionamiento tecnico ahora."
        }
    };

    // Al tocar "Tengo experiencia"
    document.querySelector('.btn-experiencia').onclick = (e) => {
        e.preventDefault();
        abrirModal('experiencia');
    };

    // Al tocar "No tengo experiencia"
    document.querySelector('.btn-iniciacion').onclick = (e) => {
        e.preventDefault();
        abrirModal('iniciacion');
    };

    document.getElementById('start-video-btn').onclick = () => {
    document.getElementById('pre-video-screen').style.display = "none";
    const player = document.getElementById('video-player');
    player.style.display = "block";
    player.play();
};

function abrirModal(tipo) {
    currentType = tipo;
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    const preScreen = document.getElementById('pre-video-screen');

    player.src = config[tipo].video;
    
    // Bloqueamos el scroll del body al abrir el modal
    document.body.style.overflow = 'hidden'; 

    modal.style.display = 'flex';
    preScreen.style.display = 'flex';
    player.style.display = "none";
}


    // Cuando tocan el botón "REPRODUCIR" dentro del modal
    document.getElementById('start-video-btn').onclick = () => {
        document.getElementById('pre-video-screen').style.display = "none";
        player.style.display = "block";
        player.play();
    };

    // CUANDO EL VIDEO TERMINA
    player.onended = () => {
        player.style.display = "none"; // Desaparece el video
        plate.style.display = "flex";  // Aparece la invitación
        
        // Cambiamos solo los textos según el video que vio
        title.innerText = config[currentType].titulo;
        text.innerText = config[currentType].subtitulo;
    };

    // Cerrar modal
    const cerrarModal = () => {
        document.getElementById('video-modal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Habilitamos scroll de nuevo
        modal.style.display = 'none';
        player.pause();
        player.src = "";
        
        // RESET FUNDAMENTAL:
        // Dejamos el video listo para la próxima y escondemos la placa
        player.style.display = "block"; 
        plate.style.display = "none";
    };

    closeBtn.onclick = cerrarModal;

    // También reseteamos si clickean fuera del rectángulo
    window.onclick = (event) => {
        if (event.target == modal) {
            cerrarModal();
        }
    };

    // --- LÓGICA DEL MENÚ LATERAL (SIDEBAR) ---
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtnmenu = document.getElementById('close-sidebar');

    // Abrir
    if (menuBtn) {
        menuBtn.onclick = () => {
            sidebar.classList.add('active');
        };
    }

    // Cerrar
    if (closeBtnmenu) {
        closeBtnmenu.onclick = () => {
            sidebar.classList.remove('active');
        };
    }
});