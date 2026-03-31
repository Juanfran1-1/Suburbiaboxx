// Variable global para la librería de teléfono
let iti;

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector("#phone");
    const regForm = document.getElementById('regForm');

    // 1. Inicializamos la librería con tus países preferidos
    iti = window.intlTelInput(input, {
        initialCountry: "ar",
        separateDialCode: true, 
        preferredCountries: ["ar", "uy", "cl", "co", "ve", "py", "br"],
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
    });

    // 2. Evento de envío del formulario
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Captura de datos
        const nombre = document.querySelectorAll('input[type="text"]')[0].value;
        const apellido = document.querySelectorAll('input[type="text"]')[1].value;
        const dni = document.querySelectorAll('input[type="text"]')[2].value;
        const pass = document.querySelectorAll('input[type="password"]')[0].value;
        const passConfirm = document.querySelectorAll('input[type="password"]')[1].value;

        // Validamos contraseñas
        if (pass !== passConfirm) {
            alert("🥊 Las contraseñas no coinciden.");
            return;
        }

        // EL DATO CLAVE: El número completo para el Admin (+54...)
        const numeroCompleto = iti.getNumber();

        console.log("Datos listos para enviar:", {
            nombre,
            apellido,
            dni,
            telefono: numeroCompleto
        });

        alert("¡Registro exitoso!" );
        
        // Simulación de redirección al panel
        // window.location.href = "../panel/index.html";
    });
});