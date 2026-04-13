import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContextBase";
import { authService } from '../../services/authService';
import { notify } from '../../components/SuburbiaToast';
import AuthInput from '../../components/AuthInput';
import logoSuburbia from '../../assets/logo-suburbia.jpg';
import '../../styles/Forms.css';
import '../../styles/Login.css';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const { authenticated, loading } = useAuth(); // Sacamos los datos del cerebro de la app
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        // Solo actuamos cuando el AuthContext terminó de cargar
        if (!loading) {
            const hash = window.location.hash;
            
            // 1. Check de errores en URL
            if (hash.includes('error')) {
                notify.error("EL LINK EXPIRÓ O ES INVÁLIDO.");
                setTimeout(() => navigate('/forgot-password'), 3000);
                return;
            }

            // 2. Check de sesión (usando el contexto, no Supabase directo)
            if (!authenticated) {
                notify.error("SESIÓN NO ENCONTRADA. VOLVÉ A INTENTAR.");
                navigate('/login');
            }
        }
    }, [loading, authenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return notify.error("LAS CONTRASEÑAS NO COINCIDEN");
        if (password.length < 8) return notify.error("MÍNIMO 8 CARACTERES");

        setIsLoading(true);
        try {
            await authService.updatePassword(password);
            notify.success("¡CONTRASEÑA ACTUALIZADA!");
            setTimeout(() => navigate('/login'), 2000);
        } catch {
            notify.error("ERROR AL ACTUALIZAR. REINTENTÁ.");
        } finally {
            setIsLoading(false);
        }
    };

    // Mientras el contexto carga, no mostramos nada (el Loader del App.jsx se encarga)
    if (loading) return null;

    return (
        <div className="login-page auth-page-layout">
            <div className="auth-card login-card fade-in">
                <img src={logoSuburbia} alt="Suburbia Boxx" className="mini-logo" />
                <div className="auth-header">
                    <h1>Nueva Contraseña</h1>
                    <p>Ingresá tu nueva clave para volver al ring.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <AuthInput 
                        label="NUEVA CONTRASEÑA"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isPasswordVisible={showPasswords}
                        toggleVisibility={() => setShowPasswords(!showPasswords)}
                        disabled={isLoading}
                    />
                    <AuthInput 
                        label="REPETIR CONTRASEÑA"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isPasswordVisible={showPasswords}
                        toggleVisibility={() => setShowPasswords(!showPasswords)}
                        disabled={isLoading}
                    />
                    <button type="submit" className={`btn-submit ${isLoading ? 'btn-disabled' : ''}`} disabled={isLoading}>
                        {isLoading ? "GUARDANDO..." : "ACTUALIZAR CONTRASEÑA"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
