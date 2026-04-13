import { useCallback, useEffect, useState } from 'react';
import NavbarAlumno from '../../components/Dashboard/NavbarAlumno';
import ClassCard from '../../components/Dashboard/ClassCard';
import MonthDateSelector from '../../components/Dashboard/MonthDateSelector';
import { clasesService } from '../../services/clasesService';
import { useAuth } from '../../context/AuthContextBase';
import { notify } from '../../components/SuburbiaToast';
import { getTodayISO } from '../../utils/dateUtils';
import '../../styles/Dashboard.css';
import '../../styles/Clases.css';

export default function MisClasesAlumno() {
    const { user } = useAuth();

    const [fechaSeleccionada, setFechaSeleccionada] = useState(getTodayISO);
    const [clases, setClases] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesandoClaseId, setProcesandoClaseId] = useState(null);

    const cargarClases = useCallback(async () => {
        if (!user?.id) return;

        setCargando(true);

        try {
            const data = await clasesService.getClasesParaAlumnoPorFecha(
                fechaSeleccionada,
                user.id
            );
            setClases(data);
        } catch (error) {
            console.error('Error cargando clases:', error);
            notify.error('NO SE PUDIERON CARGAR LAS CLASES');
        } finally {
            setCargando(false);
        }
    }, [fechaSeleccionada, user?.id]);

    useEffect(() => {
        cargarClases();
    }, [cargarClases]);

    const handleToggleInscripcion = async (claseId) => {
        const clase = clases.find((c) => c.id === claseId);
        if (!clase || !user?.id) return;

        setProcesandoClaseId(claseId);

        try {
            if (clase.alumno_inscripto) {
                await clasesService.cancelarInscripcion(
                    user.id,
                    claseId,
                    fechaSeleccionada
                );
                notify.success('INSCRIPCION CANCELADA');
            } else {
                if (clase.cupos_ocupados >= clase.cupo_maximo) {
                    notify.error('LA CLASE ESTA COMPLETA');
                    return;
                }

                await clasesService.inscribirseAClase(
                    user.id,
                    claseId,
                    fechaSeleccionada
                );
                notify.success('TE INSCRIBISTE A LA CLASE');
            }

            await cargarClases();
        } catch (error) {
            console.error('Error actualizando inscripcion:', error);
            notify.error(error.message || 'NO SE PUDO ACTUALIZAR LA INSCRIPCION');
        } finally {
            setProcesandoClaseId(null);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <NavbarAlumno />

            <div className="content-container">
                <div className="misclases-box">
                    <div className="misclases-header">
                        <h1>CLASES</h1>
                    </div>

                    <MonthDateSelector
                        selectedDate={fechaSeleccionada}
                        onSelectDate={setFechaSeleccionada}
                    />

                    <div className="clases-list">
                        {cargando ? (
                            <div className="sin-clases-msg">CARGANDO CLASES...</div>
                        ) : clases.length > 0 ? (
                            clases.map((clase) => (
                                <ClassCard
                                    key={clase.id}
                                    clase={clase}
                                    onToggleInscripcion={handleToggleInscripcion}
                                    disabled={procesandoClaseId === clase.id}
                                />
                            ))
                        ) : (
                            <div className="sin-clases-msg">
                                NO HAY CLASES DISPONIBLES PARA ESTA FECHA
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
