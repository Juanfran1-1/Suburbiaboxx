import { useEffect, useMemo, useState } from 'react';
import { clasesService } from '../../services/clasesService';
import { notify } from '../SuburbiaToast';

const DIAS = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
];

const DURACIONES = [90, 120];

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(minutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
}

function seSolapan(inicioA, duracionA, inicioB, duracionB) {
    const startA = timeToMinutes(inicioA);
    const endA = startA + duracionA;
    const startB = timeToMinutes(inicioB);
    const endB = startB + duracionB;

    return startA < endB && endA > startB;
}

export default function ClassFormModal({
    onClose,
    onSaved,
    claseInicial = null,
}) {
    const modoEdicion = !!claseInicial;

    const [profesores, setProfesores] = useState([]);
    const [clasesDelDia, setClasesDelDia] = useState([]);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cantidadInscriptos, setCantidadInscriptos] = useState(0);

    const [formData, setFormData] = useState({
        titulo: claseInicial?.titulo || '',
        dia_semana: claseInicial?.dia_semana || 'lunes',
        duracion: claseInicial?.duracion || 90,
        hora: claseInicial?.hora?.slice(0, 5) || '',
        profesor_id: claseInicial?.profesor_id || '',
        cupo_maximo: claseInicial?.cupo_maximo || 15,
        activa: claseInicial?.activa ?? true,
    });

    useEffect(() => {
        const cargarProfesores = async () => {
            try {
                const data = await clasesService.getProfesores();
                setProfesores(data);
            } catch (error) {
                console.error(error);
                notify.error('NO SE PUDIERON CARGAR LOS ENTRENADORES');
            }
        };

        cargarProfesores();
    }, []);

    useEffect(() => {
        const cargarClasesDelDia = async () => {
            setCargandoHorarios(true);
            try {
                const data = await clasesService.getTodasLasClasesPorDia(formData.dia_semana);
                setClasesDelDia(data);
            } catch (error) {
                console.error(error);
                notify.error('NO SE PUDIERON CARGAR LAS CLASES DEL DÍA');
            } finally {
                setCargandoHorarios(false);
            }
        };

        cargarClasesDelDia();
    }, [formData.dia_semana]);

    useEffect(() => {
        const cargarCantidadInscriptos = async () => {
            if (!modoEdicion || !claseInicial?.id) {
                setCantidadInscriptos(0);
                return;
            }

            try {
                const count = await clasesService.getCantidadInscriptos(claseInicial.id);
                setCantidadInscriptos(count);
            } catch (error) {
                console.error(error);
                setCantidadInscriptos(0);
            }
        };

        cargarCantidadInscriptos();
    }, [modoEdicion, claseInicial?.id]);

    const hayInscriptos = cantidadInscriptos > 0;

    const bloquearCamposEstructurales = modoEdicion && hayInscriptos;

    const horariosDisponibles = useMemo(() => {
        const inicioJornada = 8 * 60;
        const finJornada = 21 * 60;
        const slots = [];

        const clasesFiltradas = clasesDelDia.filter(
            (clase) => clase.id !== claseInicial?.id
        );

        for (let inicio = inicioJornada; inicio + Number(formData.duracion) <= finJornada; inicio += 30) {
            const horaSlot = minutesToTime(inicio);

            const ocupado = clasesFiltradas.some((clase) =>
                seSolapan(
                    horaSlot,
                    Number(formData.duracion),
                    clase.hora.slice(0, 5),
                    clase.duracion
                )
            );

            if (!ocupado) {
                slots.push(horaSlot);
            }
        }

        return slots;
    }, [clasesDelDia, formData.duracion, claseInicial?.id]);

    useEffect(() => {
        if (formData.hora && !horariosDisponibles.includes(formData.hora)) {
            setFormData((prev) => ({
                ...prev,
                hora: '',
            }));
        }
    }, [formData.hora, horariosDisponibles]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titulo.trim()) {
            return notify.error('EL TÍTULO ES OBLIGATORIO');
        }

        if (!formData.hora) {
            return notify.error('TENÉS QUE ELEGIR UN HORARIO DISPONIBLE');
        }

        if (!formData.profesor_id) {
            return notify.error('TENÉS QUE ELEGIR UN ENTRENADOR');
        }

        if (!formData.cupo_maximo || Number(formData.cupo_maximo) < 1) {
            return notify.error('EL CUPO MÁXIMO DEBE SER MAYOR A 0');
        }

        setIsLoading(true);

        try {
            const payload = {
                titulo: formData.titulo.trim(),
                dia_semana: formData.dia_semana,
                hora: formData.hora,
                duracion: Number(formData.duracion),
                profesor_id: formData.profesor_id,
                cupo_maximo: Number(formData.cupo_maximo),
                activa: formData.activa,
            };

            if (modoEdicion) {
                await clasesService.updateClaseConValidaciones(claseInicial.id, payload);
                notify.success('CLASE ACTUALIZADA');
            } else {
                await clasesService.createClase(payload);
                notify.success('CLASE CREADA');
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            notify.error(
                error.message ||
                (modoEdicion
                    ? 'NO SE PUDO ACTUALIZAR LA CLASE'
                    : 'NO SE PUDO CREAR LA CLASE')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-inner class-students-modal create-class-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}>
                    X
                </button>

                <h2 className="students-modal-title">
                    {modoEdicion ? 'EDITAR CLASE' : 'CREAR CLASE'}
                </h2>

                {hayInscriptos && (
                    <div className="class-warning-box">
                        HAY {cantidadInscriptos} ALUMNO/S INSCRIPTOS. SOLO PODÉS EDITAR
                        TÍTULO, CUPO Y ESTADO DE LA CLASE.
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>TÍTULO</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>DÍA</label>
                            <select
                                name="dia_semana"
                                value={formData.dia_semana}
                                onChange={handleChange}
                                disabled={isLoading || bloquearCamposEstructurales}
                            >
                                {DIAS.map((dia) => (
                                    <option key={dia.key} value={dia.key}>
                                        {dia.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>DURACIÓN</label>
                            <select
                                name="duracion"
                                value={formData.duracion}
                                onChange={handleChange}
                                disabled={isLoading || bloquearCamposEstructurales}
                            >
                                {DURACIONES.map((duracion) => (
                                    <option key={duracion} value={duracion}>
                                        {duracion} MIN
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>ENTRENADOR</label>
                        <select
                            name="profesor_id"
                            value={formData.profesor_id}
                            onChange={handleChange}
                            disabled={isLoading || bloquearCamposEstructurales}
                        >
                            <option value="">Seleccioná un entrenador</option>
                            {profesores.map((profe) => (
                                <option key={profe.id} value={profe.id}>
                                    {profe.nombre} {profe.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>CUPOS MÁXIMOS</label>
                        <input
                            type="number"
                            name="cupo_maximo"
                            value={formData.cupo_maximo}
                            onChange={handleChange}
                            min="1"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>HORARIOS DISPONIBLES</label>

                        {cargandoHorarios ? (
                            <div className="horarios-empty">CARGANDO HORARIOS...</div>
                        ) : horariosDisponibles.length > 0 ? (
                            <div className={`horarios-grid ${bloquearCamposEstructurales ? 'disabled-grid' : ''}`}>
                                {horariosDisponibles.map((hora) => (
                                    <button
                                        key={hora}
                                        type="button"
                                        className={
                                            formData.hora === hora
                                                ? 'horario-btn active'
                                                : 'horario-btn'
                                        }
                                        onClick={() =>
                                            !bloquearCamposEstructurales &&
                                            setFormData((prev) => ({
                                                ...prev,
                                                hora,
                                            }))
                                        }
                                        disabled={bloquearCamposEstructurales}
                                    >
                                        {hora}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="horarios-empty">
                                NO HAY HORARIOS DISPONIBLES PARA ESE DÍA Y DURACIÓN
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`btn-submit ${isLoading ? 'btn-disabled' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? modoEdicion
                                ? 'GUARDANDO...'
                                : 'CREANDO...'
                            : modoEdicion
                            ? 'GUARDAR CAMBIOS'
                            : 'CREAR CLASE'}
                    </button>
                </form>
            </div>
        </div>
    );
}
