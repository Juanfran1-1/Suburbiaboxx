import { useCallback, useEffect, useMemo, useState } from 'react';
import ClassHistoryList from '../../components/Dashboard/ClassHistoryList';
import ProgressNoteList from '../../components/Dashboard/ProgressNoteList';
import { useAuth } from '../../context/AuthContextBase';
import { notify } from '../../components/SuburbiaToast';
import { progresoService } from '../../services/progresoService';
import '../../styles/Dashboard.css';
import '../../styles/Progreso.css';

const TIPOS_NOTA = [
    { value: 'observacion', label: 'OBSERVACION' },
    { value: 'tecnica', label: 'TECNICA' },
    { value: 'conducta', label: 'CONDUCTA' },
    { value: 'lesion', label: 'LESION' },
    { value: 'objetivo', label: 'OBJETIVO' },
    { value: 'otro', label: 'OTRO' },
];

export default function ProgresoGestion({ navbar, role, title, scopeLabel }) {
    const { user } = useAuth();
    const [alumnos, setAlumnos] = useState([]);
    const [alumnoId, setAlumnoId] = useState('');
    const [historial, setHistorial] = useState([]);
    const [notas, setNotas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [notaEditando, setNotaEditando] = useState(null);

    const cargarAlumnos = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);

        try {
            const data =
                role === 'admin'
                    ? await progresoService.getAlumnosParaAdmin()
                    : await progresoService.getAlumnosParaEntrenador(user.id);

            setAlumnos(data);
            setAlumnoId((prev) => prev || data[0]?.id || '');
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDIERON CARGAR LOS ALUMNOS');
        } finally {
            setLoading(false);
        }
    }, [role, user?.id]);

    const cargarDetalle = useCallback(async () => {
        if (!alumnoId) {
            setHistorial([]);
            setNotas([]);
            return;
        }

        try {
            const [historialData, notasData] = await Promise.all([
                progresoService.getHistorialClasesAlumno(alumnoId),
                progresoService.getNotasAlumno(alumnoId),
            ]);

            setHistorial(historialData);
            setNotas(notasData);
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO CARGAR EL PROGRESO DEL ALUMNO');
        }
    }, [alumnoId]);

    useEffect(() => {
        cargarAlumnos();
    }, [cargarAlumnos]);

    useEffect(() => {
        cargarDetalle();
    }, [cargarDetalle]);

    const alumnosFiltrados = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        return alumnos.filter((alumno) =>
            `${alumno.nombre} ${alumno.apellido}`.toLowerCase().includes(term)
        );
    }, [alumnos, busqueda]);

    const alumnoSeleccionado = alumnos.find((alumno) => alumno.id === alumnoId);

    const handleSaveNota = async (payload) => {
        try {
            if (notaEditando) {
                await progresoService.actualizarNota({
                    notaId: notaEditando.id,
                    ...payload,
                });
                notify.success('NOTA ACTUALIZADA');
            } else {
                await progresoService.crearNota({
                    alumnoId,
                    autorId: user.id,
                    tipoAutor: role,
                    ...payload,
                });
                notify.success('NOTA AGREGADA');
            }

            setModalOpen(false);
            setNotaEditando(null);
            await cargarDetalle();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO GUARDAR LA NOTA');
        }
    };

    const handleOpenCreateNota = () => {
        setNotaEditando(null);
        setModalOpen(true);
    };

    const handleOpenEditNota = (nota) => {
        setNotaEditando(nota);
        setModalOpen(true);
    };

    const handleDeleteNota = async (nota) => {
        try {
            await progresoService.eliminarNota(nota.id);
            notify.success('NOTA ELIMINADA');
            await cargarDetalle();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO ELIMINAR LA NOTA');
        }
    };

    const canManageNota = (nota) => role === 'admin' || nota.autor_id === user?.id;

    return (
        <div className="dashboard-wrapper">
            {navbar}

            <div className="content-container">
                <div className="progreso-box">
                    <div className="progreso-header progreso-header-row">
                        <div>
                            <span>{scopeLabel}</span>
                            <h1>{title}</h1>
                        </div>
                        <button
                            type="button"
                            className="progreso-primary-btn"
                            onClick={handleOpenCreateNota}
                            disabled={!alumnoId}
                        >
                            AGREGAR NOTA
                        </button>
                    </div>

                    <div className="progreso-gestion-layout">
                        <aside className="progreso-alumnos-panel">
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="BUSCAR ALUMNO"
                            />

                            <div className="progreso-alumnos-list">
                                {loading ? (
                                    <div className="progreso-empty">CARGANDO...</div>
                                ) : alumnosFiltrados.length ? (
                                    alumnosFiltrados.map((alumno) => (
                                        <button
                                            key={alumno.id}
                                            type="button"
                                            className={
                                                alumnoId === alumno.id
                                                    ? 'progreso-alumno-btn active'
                                                    : 'progreso-alumno-btn'
                                            }
                                            onClick={() => setAlumnoId(alumno.id)}
                                        >
                                            <strong>
                                                {alumno.nombre} {alumno.apellido}
                                            </strong>
                                            <small>DNI {alumno.dni || '-'}</small>
                                        </button>
                                    ))
                                ) : (
                                    <div className="progreso-empty">SIN ALUMNOS</div>
                                )}
                            </div>
                        </aside>

                        <div className="progreso-main-panel">
                            <div className="progreso-selected-card">
                                <span>ALUMNO SELECCIONADO</span>
                                <h2>
                                    {alumnoSeleccionado
                                        ? `${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}`
                                        : 'SIN ALUMNO'}
                                </h2>
                            </div>

                            <section className="progreso-section">
                                <h2>HISTORIAL DE CLASES</h2>
                                <ClassHistoryList clases={historial} />
                            </section>

                            <section className="progreso-section">
                                <h2>OBSERVACIONES</h2>
                                <ProgressNoteList
                                    notas={notas}
                                    canManageNota={canManageNota}
                                    onEdit={handleOpenEditNota}
                                    onDelete={handleDeleteNota}
                                />
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <NotaProgresoModal
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveNota}
                    alumno={alumnoSeleccionado}
                    notaInicial={notaEditando}
                />
            )}
        </div>
    );
}

function NotaProgresoModal({ alumno, notaInicial = null, onClose, onSave }) {
    const [tipo, setTipo] = useState(notaInicial?.tipo || 'observacion');
    const [titulo, setTitulo] = useState(notaInicial?.titulo || '');
    const [nota, setNota] = useState(notaInicial?.nota || '');
    const [fecha, setFecha] = useState(notaInicial?.fecha || new Date().toISOString().slice(0, 10));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-inner progreso-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    X
                </button>

                <h2>{notaInicial ? 'EDITAR NOTA' : 'AGREGAR NOTA'}</h2>
                <div className="progreso-modal-field">
                    <label>ALUMNO</label>
                    <p>{alumno ? `${alumno.nombre} ${alumno.apellido}` : '-'}</p>
                </div>

                <div className="progreso-modal-field">
                    <label>FECHA</label>
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>

                <div className="progreso-modal-field">
                    <label>TIPO</label>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        {TIPOS_NOTA.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="progreso-modal-field">
                    <label>TITULO</label>
                    <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>

                <div className="progreso-modal-field">
                    <label>NOTA</label>
                    <textarea value={nota} onChange={(e) => setNota(e.target.value)} />
                </div>

                <button
                    type="button"
                    className="progreso-primary-btn full"
                    disabled={!nota.trim()}
                    onClick={() => onSave({ tipo, titulo, nota, fecha })}
                >
                    {notaInicial ? 'GUARDAR CAMBIOS' : 'GUARDAR NOTA'}
                </button>
            </div>
        </div>
    );
}
