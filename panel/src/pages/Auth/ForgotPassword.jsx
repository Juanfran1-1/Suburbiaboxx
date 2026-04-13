// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { authService } from '../../services/authService';
import { notify } from '../../components/SuburbiaToast';
import AuthInput from '../../components/AuthInput';
import BackButton from '../../components/BackButton';
import { Link } from 'react-router-dom';
import logoSuburbia from '../../assets/logo-suburbia.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            return notify.error("POR FAVOR, INGRESÁ UN EMAIL VÁLIDO.");
        }

        setIsLoading(true);
        try {
            await authService.sendPasswordReset(email);
            
            // Caso 2: Éxito
            notify.success("REVISÁ TU EMAIL. TE MANDAMOS UN LINK DE RESCATE.");
            setEmail(''); // Limpiamos para evitar re-envíos accidentales
            
        } catch (error) {
            // 1. Error de usuario no existe (el que ya tenías)
            if (error.message.includes("NO ESTÁ REGISTRADO")) {
                notify.error("EL EMAIL NO EXISTE EN NUESTRO SISTEMA.");
            } 
            // 2. Error de Rate Limit (El que te está pasando ahora)
            else if (error.message.includes("rate limit") || error.status === 429) {
                notify.error("DEMASIADOS INTENTOS. ESPERÁ UNOS MINUTOS.");
            } 
            // 3. Otros errores
            else {
                notify.error("ERROR AL ENVIAR. REINTENTÁ EN UN MOMENTO.");
            }
        } finally {
            setIsLoading(false); // ESTO SIEMPRE SE EJECUTA Y LIBERA EL BOTÓN
        }
    };

    return (
        <div className="login-page auth-page-layout">
            <BackButton to="/login" />
            <div className="auth-card login-card fade-in">
                <div className="auth-header">
                    <img src={logoSuburbia} alt="Logo" className="mini-logo" />
                    <h1>Recuperar Clave</h1>
                    <p>Ingresa el mail y te enviaremos un link de rescate.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <AuthInput 
                        label="EMAIL DE TU CUENTA"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className={`btn-submit ${isLoading ? 'btn-disabled' : ''}`} 
                        disabled={isLoading}
                    >
                        {isLoading ? "ENVIANDO..." : "ENVIAR LINK DE RESCATE"}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login">Volver al Login</Link>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;
