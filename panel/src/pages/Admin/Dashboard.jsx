import { useCallback, useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import NavbarAdmin from '../../components/Dashboard/NavBarAdmin';
import { profileService } from '../../services/profileService';
import { notify } from '../../components/SuburbiaToast';
import PlanillaAlumnoModal from '../../components/Dashboard/PlanillaAlumnoModal';
import 'react-phone-number-input/style.css';
import '../../styles/Dashboard.css';
import '../../styles/Admin.css';

function UserActionsMenu({ user, onVerPlanilla, onDarDeBaja, onDarDeAlta }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="user-actions-menu" ref={ref}>
            <button
                type="button"
                className="user-dots-btn"
                aria-label="Abrir acciones del usuario"
                onClick={() => setOpen((prev) => !prev)}
            >
                ...
            </button>

            {open && (
                <div className="user-actions-dropdown">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onVerPlanilla(user.id);
                        }}
                    >
                        VER PLANILLA
                    </button>

                    {(user.estado === 'aprobado' || user.estado === 'pendiente') && (
                        <button
                            type="button"
                            className="danger"
                            onClick={() => {
                                setOpen(false);
                                onDarDeBaja(user.id);
                            }}
                        >
                            DAR DE BAJA
                        </button>
                    )}

                    {(user.estado === 'pendiente' || user.estado === 'dado_de_baja') && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onDarDeAlta(user.id);
                            }}
                        >
                            DAR DE ALTA
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

const ADMIN_USER_INITIAL_FORM = {
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    fecha_nacimiento: '',
    rol: 'alumno',
};

function RegistrarUsuarioModal({ onClose, onSave }) {
    const [formData, setFormData] = useState(ADMIN_USER_INITIAL_FORM);
    const [guardando, setGuardando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            await onSave(formData);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="admin-user-modal">
                <button
                    type="button"
                    className="close-btn"
                    onClick={onClose}
                    disabled={guardando}
                    aria-label="Cerrar modal"
                >
                    X
                </button>

                <h2>REGISTRAR USUARIO</h2>
                <p className="admin-user-modal-hint">
                    Se crea activo y recibe un mail para definir su contrasena.
                </p>

                <form className="admin-user-form" onSubmit={handleSubmit}>
                    <div className="admin-user-form-grid">
                        <label>
                            NOMBRE
                            <input
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </label>

                        <label>
                            APELLIDO
                            <input
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </label>

                        <label>
                            EMAIL
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </label>

                        <label>
                            DNI
                            <input
                                name="dni"
                                value={formData.dni}
                                onChange={handleChange}
                                inputMode="numeric"
                                required
                                disabled={guardando}
                            />
                        </label>

                        <label className="admin-phone-field">
                            NUMERO DE TELEFONO
                            <PhoneInput
                                international
                                defaultCountry="AR"
                                value={formData.telefono}
                                onChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        telefono: value || '',
                                    }))
                                }
                                placeholder="11 2345-6789"
                                required
                                disabled={guardando}
                            />
                        </label>

                        <label>
                            FECHA DE NACIMIENTO
                            <input
                                name="fecha_nacimiento"
                                type="date"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </label>

                        <label className="full">
                            ROL
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            >
                                <option value="alumno">ALUMNO</option>
                                <option value="entrenador">ENTRENADOR</option>
                            </select>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="admin-user-submit"
                        disabled={guardando}
                    >
                        {guardando ? 'CREANDO...' : 'CREAR USUARIO'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const DashboardAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('alumnos_aprobados');
    const [filtroValor, setFiltroValor] = useState('');
    const [cargando, setCargando] = useState(true);
    const [alumnoPlanillaId, setAlumnoPlanillaId] = useState(null);
    const [gestionMenuOpen, setGestionMenuOpen] = useState(false);
    const [registroOpen, setRegistroOpen] = useState(false);

    const cargarUsuarios = useCallback(async () => {
        setUsuarios([]);
        setCargando(true);

        try {
            let data = [];

            if (filtroTipo === 'alumnos_aprobados') {
                data = await profileService.getUsersByRoleAndStatus('alumno', 'aprobado');
            } else if (filtroTipo === 'entrenadores') {
                data = await profileService.getUsersByRoleAndStatus('entrenador', 'aprobado');
            } else if (filtroTipo === 'estado') {
                data = await profileService.getUsersByStatus(filtroValor);
            }

            setUsuarios(data);
        } catch (error) {
            console.error('Error trayendo usuarios:', error.message);
            notify.error('ERROR AL CARGAR USUARIOS');
        } finally {
            setCargando(false);
        }
    }, [filtroTipo, filtroValor]);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);


    const handleDarDeBaja = async (userId) => {
        try {
            await profileService.updateStatus(userId, 'dado_de_baja');
            notify.success('USUARIO DADO DE BAJA');
            cargarUsuarios();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO DAR DE BAJA');
        }
    };

    const handleDarDeAlta = async (userId) => {
        try {
            await profileService.updateStatus(userId, 'aprobado');
            notify.success('USUARIO APROBADO');
            cargarUsuarios();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO DAR DE ALTA');
        }
    };

    const handleRegistrarUsuario = async (formData) => {
        try {
            await profileService.registrarUsuarioAdmin(formData);
            notify.success('USUARIO REGISTRADO. SE ENVIO EL MAIL.');
            setRegistroOpen(false);
            cargarUsuarios();
        } catch (error) {
            console.error(error);
            notify.error((error.message || 'NO SE PUDO REGISTRAR EL USUARIO').toUpperCase());
        }
    };

    const seleccionarFiltro = (tipo, valor) => {
        setFiltroTipo(tipo);
        setFiltroValor(valor);
        setGestionMenuOpen(false);
    };

    const tituloPanel = () => {
        if (filtroTipo === 'alumnos_aprobados') return 'PANEL DE ALUMNOS';
        if (filtroTipo === 'entrenadores') return 'PANEL DE ENTRENADORES';

        if (filtroTipo === 'estado') {
            if (filtroValor === 'pendiente') return 'PANEL DE PENDIENTES';
            if (filtroValor === 'dado_de_baja') return 'PANEL DE DADOS DE BAJA';
        }

        return 'PANEL';
    };

    return (
        <div className="dashboard-wrapper">
            <NavbarAdmin />
            <div className="content-container">
                <div className="admin-glass-box">
                    <button
                        type="button"
                        className="admin-gestion-toggle"
                        onClick={() => setGestionMenuOpen((prev) => !prev)}
                    >
                        <span className="admin-gestion-bars">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                        GESTION
                    </button>

                    {gestionMenuOpen && (
                        <button
                            type="button"
                            className="admin-menu-backdrop"
                            aria-label="Cerrar menu de gestion"
                            onClick={() => setGestionMenuOpen(false)}
                        />
                    )}

                    <aside className={gestionMenuOpen ? 'admin-aside-menu is-open' : 'admin-aside-menu'}>
                        <div className="aside-title">GESTIÓN</div>

                        <button
                            className={filtroTipo === 'alumnos_aprobados' ? 'aside-btn active' : 'aside-btn'}
                            onClick={() => {
                                seleccionarFiltro('alumnos_aprobados', '');
                            }}
                        >
                            ALUMNOS
                        </button>

                        <button
                            className={filtroTipo === 'entrenadores' ? 'aside-btn active' : 'aside-btn'}
                            onClick={() => {
                                seleccionarFiltro('entrenadores', '');
                            }}
                        >
                            ENTRENADORES
                        </button>

                        <hr className="menu-hr" />

                        <button
                            className={filtroTipo === 'estado' && filtroValor === 'pendiente' ? 'aside-btn active' : 'aside-btn'}
                            onClick={() => {
                                seleccionarFiltro('estado', 'pendiente');
                            }}
                        >
                            PENDIENTES
                        </button>

                        <button
                            className={filtroTipo === 'estado' && filtroValor === 'dado_de_baja' ? 'aside-btn active' : 'aside-btn'}
                            onClick={() => {
                                seleccionarFiltro('estado', 'dado_de_baja');
                            }}
                        >
                            DADOS DE BAJA
                        </button>

                        <button
                            type="button"
                            className="admin-register-user-btn"
                            onClick={() => {
                                setRegistroOpen(true);
                                setGestionMenuOpen(false);
                            }}
                        >
                            REGISTRAR USUARIO
                        </button>
                    </aside>

                    <div className="admin-list-container">
                        <div className="list-title">{tituloPanel()}</div>

                        <div className="list-labels">
                            <span>NOMBRE COMPLETO</span>
                        </div>

                        <div className="list-scroll">
                            {cargando ? (
                                <p className="empty-msg">Cargando...</p>
                            ) : usuarios.length > 0 ? (
                                usuarios.map((u, index) => (
                                    <div key={u.id} className="row-item">
                                        <span className="user-info">
                                            <small>{index + 1}</small> {u.nombre} {u.apellido}
                                            <span className="user-role"> | {u.rol}</span>
                                        </span>

                                        <UserActionsMenu
                                            user={u}
                                            onVerPlanilla={setAlumnoPlanillaId}
                                            onDarDeBaja={handleDarDeBaja}
                                            onDarDeAlta={handleDarDeAlta}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="empty-msg">No hay usuarios para este filtro</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {alumnoPlanillaId && (
                <PlanillaAlumnoModal
                    alumnoId={alumnoPlanillaId}
                    onClose={() => setAlumnoPlanillaId(null)}
                />
            )}

            {registroOpen && (
                <RegistrarUsuarioModal
                    onClose={() => setRegistroOpen(false)}
                    onSave={handleRegistrarUsuario}
                />
            )}
        </div>
    );
};

export default DashboardAdmin;
