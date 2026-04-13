import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextBase';
import { pagosService } from '../../services/pagosService';
import logoSuburbia from '../../assets/logo-suburbia.jpg';
import defaultUserPhoto from '../../assets/mayweather.jpg';
import '../../styles/Credential.css';

export default function UserCredential({ profileOverride = null }) {
    const { profile: authProfile } = useAuth();
    const navigate = useNavigate();
    const [estadoCuota, setEstadoCuota] = useState('CARGANDO...');
    const [estadoCuotaClass, setEstadoCuotaClass] = useState('sin_cuota');

    const profile = profileOverride || authProfile;

    useEffect(() => {
        const cargarEstadoCuota = async () => {
            if (!profile?.id || profile.rol !== 'alumno') return;

            try {
                const data = await pagosService.getPagosAlumno(profile.id);
                const estado = data?.pagoActual?.estado_visual || 'pendiente';
                setEstadoCuota(pagosService.formatEstadoPago(estado));
                setEstadoCuotaClass(estado);
            } catch (error) {
                console.error('Error cargando estado de cuota:', error);
                setEstadoCuota('SIN DATOS');
                setEstadoCuotaClass('sin_cuota');
            }
        };

        cargarEstadoCuota();
    }, [profile?.id, profile?.rol]);

    if (!profile) return null;

    const getTitulo = () => {
        if (profile.rol === 'entrenador') return 'ENTRENADOR';

        if (!profile.creado_en) return 'NOVATO';

        const ingreso = new Date(profile.creado_en);
        const hoy = new Date();
        const diferenciaAnios = (hoy - ingreso) / (1000 * 60 * 60 * 24 * 365.25);

        if (diferenciaAnios < 1) return 'NOVATO';
        if (diferenciaAnios < 3) return 'AMATEUR';
        return 'PROFESIONAL';
    };

    return (
        <div className="cred-card-suburbia">
            <h2 className="carnet-internal-title">
                {profile.rol === 'entrenador' ? 'CREDENCIAL ENTRENADOR' : 'CARNET SUBURBIA'}
            </h2>

            <div className="cred-top-logo">
                <img src={logoSuburbia} alt="SUB" />
            </div>

            <div className="cred-layout">
                <div className="cred-left">
                    <div className="cred-photo-square">
                        <img
                            src={profile.foto_url || defaultUserPhoto}
                            alt="User"
                        />
                    </div>
                    <h3 className="cred-rank">{getTitulo()}</h3>
                </div>

                <div className="cred-right">
                    <div className="cred-field full-width">
                        <label>NOMBRE COMPLETO</label>
                        <div className="cred-input-mock">
                            {profile.nombre} {profile.apellido}
                        </div>
                    </div>

                    <div className="cred-grid-container">
                        <div className="cred-field">
                            <label>DNI</label>
                            <div className="cred-input-mock">{profile.dni}</div>
                        </div>

                        <div className="cred-field">
                            <label>MIEMBRO DESDE</label>
                            <div className="cred-input-mock">
                                {profile.creado_en
                                    ? new Date(profile.creado_en).toLocaleDateString('es-AR', {
                                          month: '2-digit',
                                          year: 'numeric',
                                      })
                                    : '-'}
                            </div>
                        </div>

                        {profile.rol === 'alumno' && (
                            <>
                                <div className="cred-field">
                                    <label>ESTADO DE CUOTA</label>
                                    <div className={`cred-input-mock status-badge ${estadoCuotaClass}`}>
                                        {estadoCuota}
                                    </div>
                                </div>

                                <div className="cred-field align-end">
                                    <button
                                        className="btn-yellow-action"
                                        onClick={() => navigate('/alumno/pagos')}
                                    >
                                        VER CUOTA
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
