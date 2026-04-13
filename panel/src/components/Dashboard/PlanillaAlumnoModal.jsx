import { useEffect, useState } from 'react';
import { profileService } from '../../services/profileService';
import { clasesService } from '../../services/clasesService';
import { notify } from '../SuburbiaToast';

export default function PlanillaAlumnoModal({ alumnoId, onClose }) {
    const [loading, setLoading] = useState(true);
    const [planilla, setPlanilla] = useState(null);
    const [clasesAsignadas, setClasesAsignadas] = useState([]);

    useEffect(() => {
        const loadPlanilla = async () => {
            if (!alumnoId) return;

            try {
                setLoading(true);
                const data = await profileService.getPlanillaAlumnoCompleta(alumnoId);
                setPlanilla(data);

                if (data?.profile?.rol === 'entrenador') {
                    const clases = await clasesService.getClasesAsignadasProfesor(alumnoId);
                    setClasesAsignadas(clases);
                } else {
                    setClasesAsignadas([]);
                }
            } catch (error) {
                console.error(error);
                notify.error('NO SE PUDO CARGAR LA PLANILLA');
            } finally {
                setLoading(false);
            }
        };

        loadPlanilla();
    }, [alumnoId]);

    const handleOpenArchivo = async (archivo) => {
        try {
            if (!archivo?.storage_path) {
                notify.error('EL ARCHIVO NO TIENE RUTA VALIDA');
                return;
            }

            const signedUrl = await profileService.getSignedUrlArchivo(
                archivo.storage_path
            );

            if (signedUrl) {
                window.open(signedUrl, '_blank');
            }
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO ABRIR EL ARCHIVO');
        }
    };

    const profile = planilla?.profile;
    const datos = planilla?.datosAlumno;
    const archivos = planilla?.archivos || [];
    const esEntrenador = profile?.rol === 'entrenador';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-inner admin-planilla-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Cerrar planilla"
                >
                    X
                </button>

                {loading ? (
                    <div className="admin-planilla-loading">
                        CARGANDO PLANILLA...
                    </div>
                ) : (
                    <>
                        <div className="admin-planilla-header">
                            <img
                                src={profile?.foto_url || '/default-avatar.png'}
                                alt="avatar"
                                className="admin-planilla-avatar"
                            />

                            <div className="admin-planilla-header-info">
                                <h2>
                                    {profile?.nombre} {profile?.apellido}
                                </h2>
                                <span>{esEntrenador ? 'ENTRENADOR' : 'ALUMNO'}</span>
                            </div>
                        </div>

                        <div className="admin-planilla-sections">
                            <div className="admin-planilla-card">
                                <h3>DATOS PERSONALES</h3>

                                <div className="admin-planilla-grid">
                                    <div>
                                        <label>NOMBRE</label>
                                        <p>{profile?.nombre || '-'}</p>
                                    </div>
                                    <div>
                                        <label>APELLIDO</label>
                                        <p>{profile?.apellido || '-'}</p>
                                    </div>
                                    <div>
                                        <label>DNI</label>
                                        <p>{profile?.dni || '-'}</p>
                                    </div>
                                    <div>
                                        <label>EMAIL</label>
                                        <p>{profile?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <label>TELEFONO</label>
                                        <p>{profile?.telefono || '-'}</p>
                                    </div>

                                    {!esEntrenador && (
                                        <>
                                            <div>
                                                <label>PESO</label>
                                                <p>{datos?.peso || '-'}</p>
                                            </div>
                                            <div>
                                                <label>ALTURA</label>
                                                <p>{datos?.altura || '-'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {esEntrenador ? (
                                <div className="admin-planilla-card">
                                    <h3>CLASES ASIGNADAS</h3>

                                    {clasesAsignadas.length > 0 ? (
                                        <div className="admin-clases-asignadas-list">
                                            {clasesAsignadas.map((clase) => (
                                                <div
                                                    key={clase.id}
                                                    className="admin-clase-asignada-item"
                                                >
                                                    <strong>{clase.titulo || 'CLASE'}</strong>
                                                    <span>
                                                        {clase.dia_semana?.toUpperCase()} | {clase.hora} | {clase.duracion} MIN
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="empty-msg">
                                            NO TIENE CLASES ASIGNADAS
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="admin-planilla-card">
                                        <h3>DATOS DE TERCERO</h3>

                                        <div className="admin-planilla-grid">
                                            <div>
                                                <label>NOMBRE</label>
                                                <p>{datos?.contacto_nombre || '-'}</p>
                                            </div>
                                            <div>
                                                <label>VINCULO</label>
                                                <p>{datos?.contacto_vinculo || '-'}</p>
                                            </div>
                                            <div>
                                                <label>TELEFONO</label>
                                                <p>{datos?.contacto_telefono || '-'}</p>
                                            </div>
                                            <div className="full">
                                                <label>OBSERVACIONES</label>
                                                <p>{datos?.contacto_observaciones || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-planilla-card">
                                        <h3>SALUD</h3>

                                        <div className="admin-planilla-grid">
                                            <div className="full">
                                                <label>LESIONES PREVIAS</label>
                                                <p>{datos?.lesiones_previas || '-'}</p>
                                            </div>
                                            <div className="full">
                                                <label>MEDICACION</label>
                                                <p>{datos?.medicacion || '-'}</p>
                                            </div>
                                            <div>
                                                <label>OBRA SOCIAL</label>
                                                <p>{datos?.obra_social || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-planilla-card">
                                        <h3>ARCHIVOS</h3>

                                        {archivos.length > 0 ? (
                                            <div className="admin-archivos-list">
                                                {archivos.map((archivo) => (
                                                    <div
                                                        key={archivo.id}
                                                        className="admin-archivo-item"
                                                    >
                                                        <div>
                                                            <strong>{archivo.nombre}</strong>
                                                            <small>
                                                                {archivo.categoria
                                                                    ?.replace('_', ' ')
                                                                    .toUpperCase()}
                                                            </small>
                                                        </div>

                                                        <button
                                                            className="btn-ver-planilla"
                                                            onClick={() =>
                                                                handleOpenArchivo(archivo)
                                                            }
                                                        >
                                                            VER
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="empty-msg">
                                                NO HAY ARCHIVOS SUBIDOS
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
