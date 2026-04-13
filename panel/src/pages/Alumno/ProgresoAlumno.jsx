import { useEffect, useState } from 'react';
import NavbarAlumno from '../../components/Dashboard/NavbarAlumno';
import ClassHistoryList from '../../components/Dashboard/ClassHistoryList';
import ProgressNoteList from '../../components/Dashboard/ProgressNoteList';
import { useAuth } from '../../context/AuthContextBase';
import { progresoService } from '../../services/progresoService';
import { notify } from '../../components/SuburbiaToast';
import '../../styles/Dashboard.css';
import '../../styles/Progreso.css';

export default function ProgresoAlumno() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [notas, setNotas] = useState([]);

    useEffect(() => {
        const cargarProgreso = async () => {
            if (!user?.id) return;

            setLoading(true);

            try {
                const [historialData, notasData] = await Promise.all([
                    progresoService.getHistorialClasesAlumno(user.id),
                    progresoService.getNotasAlumno(user.id),
                ]);

                setHistorial(historialData);
                setNotas(notasData);
            } catch (error) {
                console.error(error);
                notify.error('NO SE PUDO CARGAR TU PROGRESO');
            } finally {
                setLoading(false);
            }
        };

        cargarProgreso();
    }, [user?.id]);

    const ultimaNota = notas[0];

    return (
        <div className="dashboard-wrapper">
            <NavbarAlumno />

            <div className="content-container">
                <div className="progreso-box">
                    <div className="progreso-header">
                        <span>ALUMNO</span>
                        <h1>MI PROGRESO</h1>
                    </div>

                    {loading ? (
                        <div className="sin-clases-msg">CARGANDO PROGRESO...</div>
                    ) : (
                        <>
                            <div className="progreso-summary-card">
                                <span>ULTIMA OBSERVACION</span>
                                <h2>{ultimaNota?.titulo || 'SIN OBSERVACIONES'}</h2>
                                <p>{ultimaNota?.nota || 'TODAVIA NO HAY INDICACIONES CARGADAS.'}</p>
                                {ultimaNota && (
                                    <small>
                                        {ultimaNota.autor} | {ultimaNota.fecha}
                                    </small>
                                )}
                            </div>

                            <section className="progreso-section">
                                <h2>HISTORIAL DE CLASES</h2>
                                <ClassHistoryList clases={historial} />
                            </section>

                            <section className="progreso-section">
                                <h2>OBSERVACIONES</h2>
                                <ProgressNoteList notas={notas} />
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
