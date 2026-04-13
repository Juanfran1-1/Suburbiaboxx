import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthInput from '../../components/AuthInput';
import BackButton from '../../components/BackButton';
import '../../styles/Forms.css';
import '../../styles/Login.css';
import logoSuburbia from '../../assets/logo-suburbia.jpg';
import { authService } from '../../services/authService';
import { notify } from '../../components/SuburbiaToast';
import { useAuth } from '../../context/AuthContextBase';
import { supabase } from '../../lib/supabase';

const Login = () => {
    const navigate = useNavigate();
    const { user, profile, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!loading && user && profile) {
            if (profile.rol === 'admin') {
                navigate('/admin/inicio', { replace: true });
            } else if (profile.rol === 'entrenador') {
                navigate('/entrenador/inicio', { replace: true });
            } else {
                navigate('/alumno/inicio', { replace: true });
            }
        }
    }, [user, profile, loading, navigate]);

    const toggleAllPasswords = () => {
        setShowPasswords(!showPasswords);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await supabase.auth.signOut();

            const { profile } = await authService.loginUser(email, password);

            notify.success(`¡BIENVENIDO, ${profile.nombre.toUpperCase()}!`);

            if (profile.rol === 'admin') {
                navigate('/admin/inicio', { replace: true });
            } else if (profile.rol === 'entrenador') {
                navigate('/entrenador/inicio' , {replace: true});
            } else {
                navigate('/alumno/inicio', { replace: true });
            }
        } catch (error) {
            notify.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!loading && user && profile) {
        return (
            <Navigate
                to={
                    profile.rol === 'admin'
                        ? '/admin/inicio'
                        : profile.rol === 'entrenador'
                        ? '/entrenador/inicio'
                        : '/alumno/inicio'
                }
                replace
            />
        );
    }

    if (loading) {
        return (
            <div className="login-page">
                <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>
                    Cargando sesión...
                </div>
            </div>
        );
    }

    return (
        <div className="login-page auth-page-layout">
            <BackButton to="/" />
            <div className="auth-card login-card fade-in">
                <img
                    src={logoSuburbia}
                    alt="Suburbia Boxx"
                    className="mini-logo"
                />

                <div className="auth-header">
                    <h1>Iniciar Sesión</h1>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <AuthInput
                        label="EMAIL O DNI"
                        type="text"
                        placeholder="Tu email o número de DNI"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />

                    <AuthInput
                        label="CONTRASEÑA"
                        type="password"
                        placeholder="••••••••"
                        isPasswordVisible={showPasswords}
                        toggleVisibility={toggleAllPasswords}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />

                    <Link to="/forgot-password">Olvidé mi contraseña</Link>

                    <button
                        type="submit"
                        className={`btn-submit ${isLoading ? 'btn-disabled' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'VALIDANDO...' : 'INGRESAR AL RING'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿Todavía no sos parte? <Link to="/register">Registrate</Link>
                    </p>
                </div>

                <BackButton mobileOnly to="/" />
            </div>
        </div>
    );
};

export default Login;
