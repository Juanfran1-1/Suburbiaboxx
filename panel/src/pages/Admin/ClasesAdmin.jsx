import { useCallback, useEffect, useState } from 'react';
import NavbarAdmin from '../../components/Dashboard/NavBarAdmin';
import ClassCard from '../../components/Dashboard/ClassCard';
import ClassStudentsModal from '../../components/Dashboard/ClassStudentsModal';
import ClassFormModal from '../../components/Dashboard/ClassFormModal';
import ClassActionsMenu from '../../components/Dashboard/ClassActionsMenu';
import MonthDateSelector from '../../components/Dashboard/MonthDateSelector';
import { clasesService } from '../../services/clasesService';
import { notify } from '../../components/SuburbiaToast';
import ConfirmModal from '../../components/ConfirmModal';
import { getTodayISO } from '../../utils/dateUtils';
import '../../styles/Dashboard.css';
import '../../styles/Clases.css';

const DIAS = [
    { key: 'lunes', label: 'LUN' },
    { key: 'martes', label: 'MAR' },
    { key: 'miercoles', label: 'MIE' },
    { key: 'jueves', label: 'JUE' },
    { key: 'viernes', label: 'VIE' },
    { key: 'sabado', label: 'SAB' },
];

export default function ClasesAdmin() {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(getTodayISO);
    const [diaGestion, setDiaGestion] = useState('lunes');
    const [gestionOpen, setGestionOpen] = useState(false);
    const [gestionMode, setGestionMode] = useState(null);
    const [clases, setClases] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [inscriptos, setInscriptos] = useState([]);
    const [cargandoInscriptos, setCargandoInscriptos] = useState(false);

    const [showFormModal, setShowFormModal] = useState(false);
    const [claseEditando, setClaseEditando] = useState(null);

    const [confirmData, setConfirmData] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const cargarClases = useCallback(async () => {
        setCargando(true);

        try {
            const data = gestionMode
                ? await clasesService.getClasesParaAdminPorDia(diaGestion)
                : await clasesService.getClasesParaAdminPorFecha(fechaSeleccionada);
            setClases(data);
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDIERON CARGAR LAS CLASES');
        } finally {
            setCargando(false);
        }
    }, [diaGestion, fechaSeleccionada, gestionMode]);

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
            console.error(error);
            notify.error('NO SE PUDIERON CARGAR LOS INSCRIPTOS');
        } finally {
            setCargandoInscriptos(false);
        }
    };

    const handleCerrarModal = () => {
        setClaseSeleccionada(null);
        setInscriptos([]);
    };

    const handleCrearClase = () => {
        setGestionOpen(false);
        setClaseEditando(null);
        setShowFormModal(true);
    };

    const handleGestionMode = (mode) => {
        setGestionOpen(false);
        setGestionMode(mode);
    };

    const handleSalirGestion = () => {
        setGestionMode(null);
        setGestionOpen(false);
    };

    const handleEditarClase = async (clase) => {
        try {
            const claseCompleta = await clasesService.getClaseById(clase.id);
            setClaseEditando(claseCompleta);
            setShowFormModal(true);
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO CARGAR LA CLASE');
        }
    };

    const handleEliminarClase = (clase) => {
        setConfirmData({
            title: 'ELIMINAR CLASE',
            message: `QUERES ELIMINAR LA CLASE "${clase.titulo}"?`,
            confirmText: 'ELIMINAR',
            danger: true,
            action: async () => {
                setConfirmLoading(true);
                try {
                    await clasesService.deleteClase(clase.id);
                    notify.success('CLASE ELIMINADA');
                    await cargarClases();
                    setConfirmData(null);
                } catch (error) {
                    console.error(error);
                    notify.error('NO SE PUDO ELIMINAR LA CLASE');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    const handleToggleActive = (clase) => {
        const desactivando = clase.activa;
        const esFechaPuntual = !gestionMode;

        setConfirmData({
            title: desactivando ? 'DESACTIVAR CLASE' : 'ACTIVAR CLASE',
            message: esFechaPuntual
                ? desactivando
                    ? `QUERES DESACTIVAR "${clase.titulo}" SOLO PARA ESTA FECHA?`
                    : `QUERES ACTIVAR "${clase.titulo}" SOLO PARA ESTA FECHA?`
                : desactivando
                ? `QUERES DESACTIVAR LA CLASE "${clase.titulo}" SEMANALMENTE?`
                : `QUERES ACTIVAR LA CLASE "${clase.titulo}" SEMANALMENTE?`,
            confirmText: desactivando ? 'DESACTIVAR' : 'ACTIVAR',
            danger: desactivando,
            action: async () => {
                setConfirmLoading(true);
                try {
                    if (esFechaPuntual) {
                        await clasesService.toggleActivaClaseEnFecha(
                            clase.id,
                            fechaSeleccionada,
                            !clase.activa
                        );
                    } else {
                        await clasesService.toggleActivaClase(clase.id, !clase.activa);
                    }

                    notify.success(
                        clase.activa ? 'CLASE DESACTIVADA' : 'CLASE ACTIVADA'
                    );
                    await cargarClases();
                    setConfirmData(null);
                } catch (error) {
                    console.error(error);
                    notify.error('NO SE PUDO ACTUALIZAR LA CLASE');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    return (
        <div className="dashboard-wrapper">
            <NavbarAdmin />

            <div className="content-container">
                <div className="misclases-box">
                    <div className="clases-admin-header">
                        <h1>CLASES</h1>

                        <button
                            className="class-action-btn asistir"
                            onClick={() => setGestionOpen((prev) => !prev)}
                        >
                            GESTIONAR CLASES
                        </button>

                        {gestionOpen && (
                            <div className="manage-classes-dropdown">
                                <button type="button" onClick={handleCrearClase}>
                                    CREAR CLASE
                                </button>
                                <button type="button" onClick={() => handleGestionMode('edit')}>
                                    EDITAR CLASE
                                </button>
                                <button type="button" onClick={() => handleGestionMode('delete')}>
                                    ELIMINAR CLASE
                                </button>
                                <button type="button" onClick={() => handleGestionMode('status')}>
                                    ESTADO CLASE SEMANAL
                                </button>
                            </div>
                        )}
                    </div>

                    {gestionMode ? (
                        <>
                            <div className="gestion-mode-header">
                                <span>
                                    {gestionMode === 'edit' && 'EDITAR CLASE SEMANAL'}
                                    {gestionMode === 'delete' && 'ELIMINAR CLASE SEMANAL'}
                                    {gestionMode === 'status' && 'ESTADO CLASE SEMANAL'}
                                </span>
                                <button type="button" onClick={handleSalirGestion}>
                                    VOLVER A FECHAS
                                </button>
                            </div>

                            <div className="dias-selector">
                                {DIAS.map((dia) => (
                                    <button
                                        key={dia.key}
                                        className={
                                            diaGestion === dia.key
                                                ? 'dia-btn active'
                                                : 'dia-btn'
                                        }
                                        onClick={() => setDiaGestion(dia.key)}
                                        type="button"
                                    >
                                        {dia.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <MonthDateSelector
                            selectedDate={fechaSeleccionada}
                            onSelectDate={setFechaSeleccionada}
                        />
                    )}

                    <div className="clases-list">
                        {cargando ? (
                            <div className="sin-clases-msg">CARGANDO CLASES...</div>
                        ) : clases.length > 0 ? (
                            clases.map((clase) => (
                                <div key={clase.id} className="class-card-admin-wrapper">
                                    {!clase.activa && (
                                        <span className="class-status-badge">
                                            DESACTIVADA
                                        </span>
                                    )}

                                    <ClassActionsMenu
                                        clase={clase}
                                        onEdit={handleEditarClase}
                                        onDelete={handleEliminarClase}
                                        onToggleActive={handleToggleActive}
                                        showEdit={gestionMode === 'edit'}
                                        showDelete={gestionMode === 'delete'}
                                        showToggleActive={!gestionMode || gestionMode === 'status'}
                                    />

                                    <ClassCard
                                        clase={clase}
                                        onVerInscriptos={handleVerInscriptos}
                                        mode="admin"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="sin-clases-msg">
                                {gestionMode
                                    ? 'NO HAY CLASES CARGADAS PARA ESTE DIA'
                                    : 'NO HAY CLASES CARGADAS PARA ESTA FECHA'}
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

            {showFormModal && (
                <ClassFormModal
                    onClose={() => {
                        setShowFormModal(false);
                        setClaseEditando(null);
                    }}
                    onSaved={cargarClases}
                    claseInicial={claseEditando}
                />
            )}

            {confirmData && (
                <ConfirmModal
                    title={confirmData.title}
                    message={confirmData.message}
                    confirmText={confirmData.confirmText}
                    danger={confirmData.danger}
                    loading={confirmLoading}
                    onCancel={() => {
                        if (!confirmLoading) setConfirmData(null);
                    }}
                    onConfirm={confirmData.action}
                />
            )}
        </div>
    );
}
