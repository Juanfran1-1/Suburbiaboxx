import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NavbarAdmin from '../../components/Dashboard/NavBarAdmin';
import { notify } from '../../components/SuburbiaToast';
import { pagosService } from '../../services/pagosService';
import '../../styles/Dashboard.css';
import '../../styles/Pagos.css';

const ESTADOS = [
    { value: 'todos', label: 'TODOS' },
    { value: 'pagado', label: 'PAGADOS' },
    { value: 'vencido', label: 'VENCIDOS' },
    { value: 'sin_cuota', label: 'SIN CUOTA' },
];

const METODOS = [
    { value: 'efectivo', label: 'EFECTIVO' },
    { value: 'transferencia', label: 'TRANSFERENCIA' },
    { value: 'mercado_pago', label: 'MERCADO PAGO' },
    { value: 'otro', label: 'OTRO' },
];

const MESES = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
];

const formatMoney = (value) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

function PagoActionsMenu({
    item,
    onRegistrarPago,
    onAplicarPromo,
    onQuitarPromo,
    onVerHistorial,
    onMarcarVencido,
}) {
    const [open, setOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateDropdownPosition = useCallback(() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;

        const dropdownWidth = 190;
        const spacing = -2;

        setDropdownPosition({
            top: rect.bottom + spacing,
            left: Math.max(8, rect.right - dropdownWidth),
        });
    }, []);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e) => {
            const clickedMenu = menuRef.current?.contains(e.target);
            const clickedDropdown = dropdownRef.current?.contains(e.target);

            if (!clickedMenu && !clickedDropdown) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('scroll', updateDropdownPosition, true);
        };
    }, [open, updateDropdownPosition]);

    return (
        <div className="pago-actions-menu" ref={menuRef}>
            <button
                ref={buttonRef}
                type="button"
                className="pago-dots-btn"
                onClick={() => {
                    updateDropdownPosition();
                    setOpen((prev) => !prev);
                }}
            >
                ...
            </button>

            {open && dropdownPosition && createPortal(
                <div
                    ref={dropdownRef}
                    className="pago-actions-dropdown"
                    style={dropdownPosition}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onRegistrarPago(item);
                        }}
                    >
                        REGISTRAR PAGO
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onAplicarPromo(item);
                        }}
                    >
                        APLICAR PROMO
                    </button>
                    {item.promoInfo && (
                        <button
                            type="button"
                            className="danger"
                            onClick={() => {
                                setOpen(false);
                                onQuitarPromo(item);
                            }}
                        >
                            QUITAR PROMO
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onVerHistorial(item);
                        }}
                    >
                        VER HISTORIAL
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onMarcarVencido(item);
                        }}
                    >
                        MARCAR VENCIDO
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}

function ModalShell({ title, children, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-inner pagos-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    X
                </button>
                <h2>{title}</h2>
                {children}
            </div>
        </div>
    );
}

export default function PagosAdmin() {
    const periodoActual = pagosService.getPeriodoActual();
    const [mes, setMes] = useState(periodoActual.mes);
    const [anio, setAnio] = useState(periodoActual.anio);
    const [estadoFiltro, setEstadoFiltro] = useState('todos');
    const [planFiltro, setPlanFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');

    const [resumen, setResumen] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [abiertoId, setAbiertoId] = useState(null);
    const [modal, setModal] = useState(null);

    const cargarDatos = useCallback(async () => {
        setLoading(true);

        try {
            const [resumenData, planesData] = await Promise.all([
                pagosService.getResumenPagosAdmin(Number(mes), Number(anio)),
                pagosService.getPlanes(),
            ]);

            setResumen(resumenData);
            setPlanes(planesData);
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDIERON CARGAR LOS PAGOS');
        } finally {
            setLoading(false);
        }
    }, [anio, mes]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const resumenFiltrado = useMemo(() => {
        return resumen.filter((item) => {
            const nombreCompleto = `${item.alumno.nombre} ${item.alumno.apellido}`.toLowerCase();
            const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase().trim());
            const coincideEstado =
                estadoFiltro === 'todos' || item.pago.estado_visual === estadoFiltro;
            const coincidePlan = planFiltro === 'todos' || item.plan?.id === planFiltro;

            return coincideBusqueda && coincideEstado && coincidePlan;
        });
    }, [busqueda, estadoFiltro, planFiltro, resumen]);

    const handleAplicarPromo = async ({ alumnoId, companeroId }) => {
        if (!companeroId || alumnoId === companeroId) {
            notify.error('TENES QUE ELEGIR OTRO ALUMNO');
            return;
        }

        try {
            await pagosService.aplicarPromo2x1(alumnoId, companeroId);
            notify.success('PROMO APLICADA');
            setModal(null);
            await cargarDatos();
        } catch (error) {
            console.error(error);
            notify.error(error.message || 'NO SE PUDO APLICAR LA PROMO');
        }
    };

    const handleQuitarPromo = async (item) => {
        try {
            await pagosService.quitarPromo(item.promoInfo.promo_grupo_id);
            notify.success('PROMO QUITADA');
            await cargarDatos();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO QUITAR LA PROMO');
        }
    };

    const handleRegistrarPago = async (data) => {
        try {
            await pagosService.registrarPago(data);
            notify.success('PAGO REGISTRADO');
            setModal(null);
            await cargarDatos();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO REGISTRAR EL PAGO');
        }
    };

    const handleMarcarVencido = async (item) => {
        try {
            await pagosService.marcarVencido({
                alumnoId: item.alumno.id,
                plan: item.plan,
                promoInfo: item.promoInfo,
                mes: Number(mes),
                anio: Number(anio),
            });
            notify.success('PAGO MARCADO VENCIDO');
            await cargarDatos();
        } catch (error) {
            console.error(error);
            notify.error('NO SE PUDO ACTUALIZAR EL PAGO');
        }
    };

    return (
        <div className="dashboard-wrapper">
            <NavbarAdmin />

            <div className="content-container">
                <div className="pagos-box">
                    <div className="pagos-header">
                        <div>
                            <span>ADMIN</span>
                            <h1>PAGOS</h1>
                        </div>
                    </div>

                    <div className="pagos-filtros">
                        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                            {MESES.map((label, index) => (
                                <option key={label} value={index + 1}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={anio}
                            onChange={(e) => setAnio(Number(e.target.value))}
                        />

                        <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                        >
                            {ESTADOS.map((estado) => (
                                <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={planFiltro}
                            onChange={(e) => setPlanFiltro(e.target.value)}
                        >
                            <option value="todos">TODOS LOS PLANES</option>
                            {planes.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.nombre.toUpperCase()}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="BUSCAR ALUMNO"
                        />
                    </div>

                    <div className="pagos-list">
                        {loading ? (
                            <div className="sin-clases-msg">CARGANDO PAGOS...</div>
                        ) : resumenFiltrado.length ? (
                            resumenFiltrado.map((item) => {
                                const abierto = abiertoId === item.alumno.id;
                                const nombre = `${item.alumno.nombre} ${item.alumno.apellido}`;

                                return (
                                    <div key={item.alumno.id} className="pago-accordion-item">
                                        <div className="pago-row-main">
                                            <button
                                                type="button"
                                                className="pago-row-toggle"
                                                onClick={() =>
                                                    setAbiertoId(abierto ? null : item.alumno.id)
                                                }
                                            >
                                                <span className="pago-arrow">{abierto ? 'v' : '>'}</span>
                                                <span className="pago-row-name">{nombre}</span>
                                                <span className="pago-row-total">
                                                    {formatMoney(item.pago.total)}
                                                </span>
                                                <span className={`pago-status ${item.pago.estado_visual}`}>
                                                    {pagosService.formatEstadoPago(item.pago.estado_visual)}
                                                </span>
                                            </button>

                                            <PagoActionsMenu
                                                item={item}
                                                onRegistrarPago={(value) =>
                                                    setModal({ type: 'pago', item: value })
                                                }
                                                onAplicarPromo={(value) =>
                                                    setModal({ type: 'promo', item: value })
                                                }
                                                onQuitarPromo={handleQuitarPromo}
                                                onVerHistorial={(value) =>
                                                    setModal({ type: 'historial', item: value })
                                                }
                                                onMarcarVencido={handleMarcarVencido}
                                            />
                                        </div>

                                        {abierto && (
                                            <div className="pago-row-detail">
                                                <div className="pago-detail-grid">
                                                    <div>
                                                        <label>PLAN</label>
                                                        <p>{item.plan?.nombre || 'SIN PLAN'}</p>
                                                    </div>
                                                    <div>
                                                        <label>PRECIO BASE</label>
                                                        <p>{formatMoney(item.pago.precio_base)}</p>
                                                    </div>
                                                    <div>
                                                        <label>PROMO</label>
                                                        <p>{item.promoInfo?.promo?.nombre || 'SIN PROMO'}</p>
                                                    </div>
                                                    <div>
                                                        <label>DESCUENTO</label>
                                                        <p>
                                                            {item.pago.descuento_tipo
                                                                ? `${item.pago.descuento_valor} ${
                                                                      item.pago.descuento_tipo === 'porcentaje'
                                                                          ? '%'
                                                                          : ''
                                                                  }`
                                                                : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label>COMPAÑERO PROMO</label>
                                                        <p>
                                                            {item.companeros.length
                                                                ? item.companeros
                                                                      .map(
                                                                          (compa) =>
                                                                              `${compa.profile?.nombre || ''} ${
                                                                                  compa.profile?.apellido || ''
                                                                              }`.trim()
                                                                      )
                                                                      .join(', ')
                                                                : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label>ESTADO PROMO</label>
                                                        <p>
                                                            {item.promoInfo
                                                                ? item.promoEnRiesgo
                                                                    ? 'EN RIESGO'
                                                                    : 'ACTIVA'
                                                                : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label>METODO</label>
                                                        <p>{item.pago.metodo_pago || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <label>FECHA PAGO</label>
                                                        <p>{item.pago.fecha_pago || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <label>VENCE</label>
                                                        <p>
                                                            {pagosService.formatFecha(
                                                                pagosService.getPeriodoVencimiento(
                                                                    item.pago.mes,
                                                                    item.pago.anio
                                                                )
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {item.promoEnRiesgo && (
                                                    <div className="pago-warning">
                                                        PROMO EN RIESGO: ALGUN INTEGRANTE DEL GRUPO TODAVIA NO PAGO ESTE MES.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="sin-clases-msg">NO HAY ALUMNOS PARA ESTE FILTRO</div>
                        )}
                    </div>
                </div>
            </div>

            {modal?.type === 'promo' && (
                <AplicarPromoModal
                    item={modal.item}
                    alumnos={resumen}
                    onClose={() => setModal(null)}
                    onSave={handleAplicarPromo}
                />
            )}

            {modal?.type === 'pago' && (
                <RegistrarPagoModal
                    item={modal.item}
                    planes={planes}
                    mes={Number(mes)}
                    anio={Number(anio)}
                    onClose={() => setModal(null)}
                    onSave={handleRegistrarPago}
                />
            )}

            {modal?.type === 'historial' && (
                <HistorialPagoModal
                    item={modal.item}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}

function AplicarPromoModal({ item, alumnos, onClose, onSave }) {
    const [companeroId, setCompaneroId] = useState('');

    return (
        <ModalShell title="APLICAR PROMO 2X1" onClose={onClose}>
            <div className="pagos-modal-field">
                <label>ALUMNO</label>
                <p>{item.alumno.nombre} {item.alumno.apellido}</p>
            </div>
            <div className="pagos-modal-field">
                <label>COMPAÑERO</label>
                <select value={companeroId} onChange={(e) => setCompaneroId(e.target.value)}>
                    <option value="">SELECCIONAR ALUMNO</option>
                    {alumnos
                        .filter((alumnoItem) => alumnoItem.alumno.id !== item.alumno.id)
                        .map((alumnoItem) => (
                            <option key={alumnoItem.alumno.id} value={alumnoItem.alumno.id}>
                                {alumnoItem.alumno.nombre} {alumnoItem.alumno.apellido}
                            </option>
                        ))}
                </select>
            </div>
            <div className="pago-warning">
                ESTA PROMO APLICA 10% A AMBOS ALUMNOS. SI ALGUNO YA TENIA UNA PROMO ACTIVA, SE REEMPLAZA.
            </div>
            <button
                className="pagos-primary-btn"
                type="button"
                onClick={() =>
                    onSave({
                        alumnoId: item.alumno.id,
                        companeroId,
                    })
                }
                disabled={!companeroId}
            >
                APLICAR PROMO
            </button>
        </ModalShell>
    );
}

function RegistrarPagoModal({ item, planes, mes, anio, onClose, onSave }) {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
    const [nota, setNota] = useState('');
    const [aplicarDescuento, setAplicarDescuento] = useState(!!item.promoInfo);
    const [planId, setPlanId] = useState(item.plan?.id || '');
    const planSeleccionado =
        planes.find((plan) => plan.id === planId) || item.plan || null;

    const total = pagosService.calcularTotal(
        Number(planSeleccionado?.precio || 0),
        item.promoInfo?.promo,
        aplicarDescuento
    );
    const vencimiento = pagosService.getPeriodoVencimiento(mes, anio);

    return (
        <ModalShell title="REGISTRAR PAGO" onClose={onClose}>
            <div className="pago-resumen-modal">
                <strong>{item.alumno.nombre} {item.alumno.apellido}</strong>
                <span>{pagosService.formatPeriodo(mes, anio)}</span>
                <p>PLAN: {planSeleccionado?.nombre || 'SIN PLAN'}</p>
                <p>PRECIO BASE: {formatMoney(planSeleccionado?.precio || 0)}</p>
                <p>PROMO: {item.promoInfo?.promo?.nombre || 'SIN PROMO'}</p>
                <p>VENCE: {pagosService.formatFecha(vencimiento)}</p>
                <h3>TOTAL: {formatMoney(total)}</h3>
            </div>

            <div className="pagos-modal-field">
                <label>PLAN A COBRAR</label>
                <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
                    <option value="">SELECCIONAR PLAN</option>
                    {planes.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                            {plan.nombre.toUpperCase()} - {formatMoney(plan.precio)}
                        </option>
                    ))}
                </select>
            </div>

            {item.promoEnRiesgo && (
                <div className="pago-warning">
                    PROMO EN RIESGO: EL GRUPO TODAVIA NO ESTA COMPLETO EN PAGOS.
                </div>
            )}

            {item.promoInfo && (
                <label className="pagos-checkbox">
                    <input
                        type="checkbox"
                        checked={aplicarDescuento}
                        onChange={(e) => setAplicarDescuento(e.target.checked)}
                    />
                    APLICAR DESCUENTO DE PROMO
                </label>
            )}

            <div className="pagos-modal-field">
                <label>METODO</label>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                    {METODOS.map((metodo) => (
                        <option key={metodo.value} value={metodo.value}>
                            {metodo.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="pagos-modal-field">
                <label>FECHA DE PAGO</label>
                <input
                    type="date"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                />
            </div>

            <div className="pagos-modal-field">
                <label>NOTA</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} />
            </div>

            <button
                className="pagos-primary-btn"
                type="button"
                onClick={() =>
                    onSave({
                        alumnoId: item.alumno.id,
                        plan: planSeleccionado,
                        promoInfo: item.promoInfo,
                        mes,
                        anio,
                        metodoPago,
                        fechaPago,
                        nota,
                        aplicarDescuento,
                    })
                }
                disabled={!planSeleccionado}
            >
                CONFIRMAR PAGO
            </button>
        </ModalShell>
    );
}

function HistorialPagoModal({ item, onClose }) {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistorial = async () => {
            try {
                const data = await pagosService.getHistorialAlumno(item.alumno.id);
                setHistorial(data);
            } catch (error) {
                console.error(error);
                notify.error('NO SE PUDO CARGAR EL HISTORIAL');
            } finally {
                setLoading(false);
            }
        };

        loadHistorial();
    }, [item.alumno.id]);

    return (
        <ModalShell title="HISTORIAL DE PAGOS" onClose={onClose}>
            <div className="pagos-modal-field">
                <label>ALUMNO</label>
                <p>{item.alumno.nombre} {item.alumno.apellido}</p>
            </div>

            {loading ? (
                <div className="sin-clases-msg">CARGANDO HISTORIAL...</div>
            ) : historial.length ? (
                <div className="pagos-historial-list">
                    {historial.map((pago) => (
                        <div key={pago.id} className="pago-historial-item">
                            <strong>PLAN: {pago.plan?.nombre || 'SIN PLAN'}</strong>
                            <span className={`pago-status ${pago.estado}`}>
                                {pagosService.formatEstadoPago(pago.estado)}
                            </span>
                            <small>FECHA: {pagosService.formatFechaISO(pago.fecha_pago)}</small>
                            <small>{formatMoney(pago.total)} - {pago.metodo_pago || '-'}</small>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="sin-clases-msg">NO HAY PAGOS REGISTRADOS</div>
            )}
        </ModalShell>
    );
}
