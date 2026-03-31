document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Guardamos los valores
        const userInput = document.getElementById('user').value.trim();
        const passInput = document.getElementById('pass').value.trim();
        const btnSubmit = document.querySelector('.btn-submit');

        // 2. Validaciones rápidas (Front-end)
        if (!userInput || !passInput) {
            alert("¡Falta información! ");
            return;
        }

        // 3. Bloqueamos el botón mientras "piensa"
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "VALIDANDO CREDENCIALES...";
        btnSubmit.style.opacity = "0.7";
        btnSubmit.disabled = true;

        try {
            /* AQUÍ CONECTAREMOS CON JS (Supabase) */
            console.log("Intentando ingresar con:", userInput);

            // Simulamos una demora de red de 1.5 segundos
            setTimeout(() => {
                // Simulación de éxito (esto luego vendrá de la base de datos)
                const loginExitoso = true; 

                if (loginExitoso) {
                    // Guardamos la sesión local para que el Panel sepa quién entró
                    localStorage.setItem('usuarioActivo', userInput);
                    
                    // ¡Directo al Panel del Alumno!
                    window.location.href = "../../credencial.html"; 
                } else {
                    alert("Usuario o contraseña incorrectos.");
                    resetButton(btnSubmit, originalText);
                }
            }, 1500);

        } catch (error) {
            console.error("Error de login:", error);
            alert("Hubo un problema técnico. Intentá más tarde.");
            resetButton(btnSubmit, originalText);
        }
    });
});

// Función para devolver el botón a su estado normal
function resetButton(btn, text) {
    btn.innerText = text;
    btn.style.opacity = "1";
    btn.disabled = false;
}