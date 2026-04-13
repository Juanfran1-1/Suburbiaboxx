// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContextBase';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        // En lugar de null, mostramos algo para saber que la app está viva
        return <div style={{color: 'white', textAlign: 'center', marginTop: '20%'}}>RECUPERANDO CONEXIÓN...</div>; 
    }

    if (!user) return <Navigate to="/login" replace />;

    // Si el perfil tarda en llegar pero el usuario ya está, esperamos un poco
    if (allowedRoles && !profile) {
    return <div style={{color: 'white', textAlign: 'center', marginTop: '20%'}}>
        Cargando perfil...
    </div>;
    }

    if (profile?.estado && profile.estado !== 'aprobado') {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(profile?.rol)) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
