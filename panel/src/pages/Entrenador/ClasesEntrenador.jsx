import { useCallback, useEffect, useState } from 'react';
import NavbarEntrenador from '../../components/Dashboard/NavBarEntrenador';
import ClassCard from '../../components/Dashboard/ClassCard';
import ClassStudentsModal from '../../components/Dashboard/ClassStudentsModal';
import MonthDateSelector from '../../components/Dashboard/MonthDateSelector';
import { clasesService } from '../../services/clasesService';
import { useAuth } from '../../context/AuthContextBase';
import { notify } from '../../components/SuburbiaToast';
import { getTodayISO } from '../../utils/dateUtils';
import '../../styles/Dashboard.css';
import '../../styles/Clases.css';

export default function ClasesEntrenador() {
    const { user } = useAuth();

    const [fechaSeleccionada, setFechaSeleccionada] = useState(getTodayISO);
    const [clases, setClases] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [inscriptos, setInscriptos] = useState([]);
    const [cargandoInscriptos, setCargandoInscriptos] = useState(false);

    const cargarClases = useCallback(async () => {
        if (!user?.id) return;

        setCargando(true);

        try {
            const data = await clasesService.getClasesParaEntrenadorPorFecha(
                fechaSeleccionada,
                user.id
            );
            setClases(data);
        } catch (error) {
            console.error('Error cargando clases del entrenador:', error);
            notify.error('NO SE PUDIERON CARGAR TUS CLASES');
        } finally {
            setCargando(false);
        }
    }, [fechaSeleccionada, user?.id]);

    useEffect(() => {
        cargarClases();
    }, [cargarClases]);

    const handleVerInscriptos = async (claseId) => {
        const clase = clases.find((c) => c.id === claseId);
        if (!clase) return;

        setClaseSeleccionada(clase);
        setCargandoInscriptos(true);

        try {
            const data = await clasesService.getInscriptosDeClase(
                claseId,
                fechaSeleccionada
            );
            setInscriptos(data);
        } catch (error) {
            console.error('Error cargando inscriptos:', error);
            notify.error('NO SE PUDIERON CARGAR LOS INSCRIPTOS');
        } finally {
            setCargandoInscriptos(false);
        }
    };

    const handleCerrarModal = () => {
        setClaseSeleccionada(null);
        setInscriptos([]);
    };

    return (
        <div className="dashboard-wrapper">
            <NavbarEntrenador />

            <div className="content-container">
                <div className="misclases-box">
                    <div className="misclases-header">
                        <h1>MIS CLASES</h1>
                    </div>

                    <MonthDateSelector
                        selectedDate={fechaSeleccionada}
                        onSelectDate={setFechaSeleccionada}
                    />

                    <div className="clases-list">
                        {cargando ? (
                            <div className="sin-clases-msg">
                                CARGANDO CLASES...
                            </div>
                        ) : clases.length > 0 ? (
                            clases.map((clase) => (
                                <ClassCard
                                    key={clase.id}
                                    clase={clase}
                                    onVerInscriptos={handleVerInscriptos}
                                    mode="entrenador"
                                />
                            ))
                        ) : (
                            <div className="sin-clases-msg">
                                NO TENES CLASES ASIGNADAS PARA ESTA FECHA
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {claseSeleccionada && (
                <ClassStudentsModal
                    claseTitulo={claseSeleccionada.titulo}
                    alumnos={inscriptos}
                    cargando={cargandoInscriptos}
                    onClose={handleCerrarModal}
                />
            )}
        </div>
    );
}
