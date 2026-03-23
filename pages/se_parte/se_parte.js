document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    const plate = document.getElementById('conversion-plate');
    const preScreen = document.getElementById('pre-video-screen');
    const closeBtn = document.querySelector('.close-btn');
    
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
            video: "../../assets/video_iniciacion.mp4", // Asegurate que el nombre del archivo sea exacto (mayúsculas/minúsculas)
            titulo: "¡EL EQUIPO TE ESPERA!",
            subtitulo: "Unite al grupo y coordiná tu clase de reacondicionamiento tecnico ahora."
        }
    };

    function abrirModal(tipo) {
        currentType = tipo;
        
        // 1. Seteamos el video y lo CARGAMOS
        player.src = config[tipo].video;
        player.load(); 
        
        // 2. IMPORTANTE para iPhone: Empezar muteado suele evitar el "tachado"
        // El usuario igual puede activar el sonido con los controles
        player.muted = false; 

        document.body.style.overflow = 'hidden'; 
        modal.style.display = 'flex';
        preScreen.style.display = 'flex';
        plate.style.display = 'none';
        player.style.display = "none";
    }

    // Al tocar los botones de la página
    document.querySelector('.btn-experiencia').onclick = (e) => {
        e.preventDefault();
        abrirModal('experiencia');
    };

    document.querySelector('.btn-iniciacion').onclick = (e) => {
        e.preventDefault();
        abrirModal('iniciacion');
    };

    // BOTÓN REPRODUCIR (El que arregla el problema del iPhone)
    document.getElementById('start-video-btn').onclick = () => {
        preScreen.style.display = "none";
        player.style.display = "block";
        
        // Intentamos reproducir con una promesa (requerido en móviles modernos)
        let playPromise = player.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Reproducción automática prevenida. Intentando con mute...");
                player.muted = true;
                player.play();
            });
        }
    };

    // CUANDO EL VIDEO TERMINA
    player.onended = () => {
        player.style.display = "none";
        plate.style.display = "flex";
        
        title.innerText = config[currentType].titulo;
        text.innerText = config[currentType].subtitulo;
    };

    // Cerrar modal
    const cerrarModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        player.pause();
        player.src = "";
        plate.style.display = "none";
    };

    closeBtn.onclick = cerrarModal;

    window.onclick = (event) => {
        if (event.target == modal) {
            cerrarModal();
        }
    };

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