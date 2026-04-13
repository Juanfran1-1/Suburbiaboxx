import { useEffect, useState } from 'react';
import NavbarAlumno from '../../components/Dashboard/NavbarAlumno';
import { useAuth } from '../../context/AuthContextBase';
import { notify } from '../../components/SuburbiaToast';
import { pagosService } from '../../services/pagosService';
import '../../styles/Dashboard.css';
import '../../styles/Pagos.css';

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

export default function PagosAlumno() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const cargarPagos = async () => {
            if (!user?.id) return;

            setLoading(true);

            try {
                const pagosData = await pagosService.getPagosAlumno(user.id);
                setData(pagosData);
            } catch (error) {
                console.error(error);
                notify.error('NO SE PUDIERON CARGAR TUS PAGOS');
            } finally {
                setLoading(false);
            }
        };

        cargarPagos();
    }, [user?.id]);

    const pagoActual = data?.pagoActual;
    const promo = data?.promoInfo?.promo;
    const vencimiento = pagoActual
        ? pagosService.getPeriodoVencimiento(pagoActual.mes, pagoActual.anio)
        : null;

    return (
        <div className="dashboard-wrapper">
            <NavbarAlumno />

            <div className="content-container">
                <div className="pagos-box pagos-alumno-box">
                    <div className="pagos-header">
                        <div>
                            <span>ALUMNO</span>
                            <h1>MIS PAGOS</h1>
                        </div>
                    </div>

                    {loading ? (
                        <div className="sin-clases-msg">CARGANDO PAGOS...</div>
                    ) : (
                        <>
                            <div className="pago-actual-card">
                                <div className="pago-actual-top">
                                    <span>
                                        {MESES[(pagoActual?.mes || 1) - 1]} {pagoActual?.anio}
                                    </span>
                                    <strong className={`pago-status ${pagoActual?.estado_visual}`}>
                                        {pagosService.formatEstadoPago(pagoActual?.estado_visual)}
                                    </strong>
                                </div>

                                <div className="pago-actual-grid">
                                    <div>
                                        <label>PLAN</label>
                                        <p>{data?.plan?.nombre || 'SIN PLAN ASIGNADO'}</p>
                                    </div>
                                    <div>
                                        <label>PROMO</label>
                                        <p>{promo ? `${promo.nombre} ACTIVA` : 'SIN PROMO'}</p>
                                    </div>
                                    <div>
                                        <label>TOTAL DEL MES</label>
                                        <p className="pago-total-destacado">
                                            {formatMoney(pagoActual?.total)}
                                        </p>
                                    </div>
                                    <div>
                                        <label>FECHA PAGO</label>
                                        <p>{pagoActual?.fecha_pago || '-'}</p>
                                    </div>
                                    <div>
                                        <label>VENCE</label>
                                        <p>
                                            {vencimiento
                                                ? pagosService.formatFecha(vencimiento)
                                                : '-'}
                                        </p>
                                    </div>
                                </div>

                                {promo && (
                                    <div className="pago-warning pago-warning-soft">
                                        TU PROMO ESTA ACTIVA. SI EL GRUPO QUEDA EN REVISION, CONSULTA EN RECEPCION.
                                    </div>
                                )}
                            </div>

                            <div className="pagos-historial-panel">
                                <h2>HISTORIAL</h2>

                                {data?.historial?.length ? (
                                    <div className="pagos-historial-list">
                                        {data.historial.map((pago) => (
                                            <div key={pago.id} className="pago-historial-item">
                                                <strong>PLAN: {pago.plan?.nombre || 'SIN PLAN'}</strong>
                                                <span className={`pago-status ${pago.estado}`}>
                                                    {pagosService.formatEstadoPago(pago.estado)}
                                                </span>
                                                <small>
                                                    FECHA: {pagosService.formatFechaISO(pago.fecha_pago)}
                                                </small>
                                                <small>
                                                    {formatMoney(pago.total)} - {pago.metodo_pago || '-'}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="sin-clases-msg">TODAVIA NO HAY PAGOS REGISTRADOS</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
