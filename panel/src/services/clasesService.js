import { supabase } from '../lib/supabase';
import { getDiaSemanaKey } from '../utils/dateUtils';

const ORDEN_DIAS = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 7,
};

const formatearProfesor = (profesor) =>
    profesor ? `${profesor.nombre} ${profesor.apellido}` : 'SIN PROFESOR';

const armarClaseCard = (clase, cantidadInscriptos, extra = {}) => ({
    id: clase.id,
    titulo: clase.titulo,
    profesor: formatearProfesor(clase.profesor),
    dia_semana: clase.dia_semana,
    hora: clase.hora?.slice(0, 5) || '',
    duracion: clase.duracion,
    cupos_ocupados: cantidadInscriptos,
    cupo_maximo: clase.cupo_maximo,
    ...extra,
});

export const clasesService = {
    getTodasLasClasesPorDiaYProfesor: async (dia, profesorId) => {
        const { data, error } = await supabase
            .from('clases')
            .select(`
                *,
                profesor:profesor_id ( id, nombre, apellido )
            `)
            .eq('dia_semana', dia)
            .eq('profesor_id', profesorId)
            .order('hora', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getExcepcionesPorFecha: async (fechaClase) => {
        const { data, error } = await supabase
            .from('clases_excepciones')
            .select('clase_id, activa')
            .eq('fecha_clase', fechaClase);

        if (error) {
            console.error('Error cargando excepciones de clases:', error);
            return new Map();
        }

        return new Map((data || []).map((item) => [item.clase_id, item.activa]));
    },

    aplicarEstadoPorFecha: async (clases, fechaClase, soloActivas = false) => {
        const excepciones = await clasesService.getExcepcionesPorFecha(fechaClase);

        return clases
            .map((clase) => {
                const tieneExcepcion = excepciones.has(clase.id);
                const activaFecha = tieneExcepcion
                    ? excepciones.get(clase.id)
                    : clase.activa;

                return {
                    ...clase,
                    activa_base: clase.activa,
                    activa: activaFecha,
                    tiene_excepcion_fecha: tieneExcepcion,
                    fecha_clase: fechaClase,
                };
            })
            .filter((clase) => !soloActivas || clase.activa);
    },

    getClasesAsignadasProfesor: async (profesorId) => {
        const { data, error } = await supabase
            .from('clases')
            .select('id, titulo, dia_semana, hora, duracion, activa')
            .eq('profesor_id', profesorId)
            .order('dia_semana', { ascending: true })
            .order('hora', { ascending: true });

        if (error) throw error;
        return (data || [])
            .map((clase) => ({
                id: clase.id,
                titulo: clase.titulo,
                dia_semana: clase.dia_semana,
                hora: clase.hora?.slice(0, 5) || '',
                duracion: clase.duracion,
                activa: clase.activa,
            }))
            .sort((a, b) => {
                const diaA = ORDEN_DIAS[a.dia_semana] || 99;
                const diaB = ORDEN_DIAS[b.dia_semana] || 99;

                if (diaA !== diaB) return diaA - diaB;
                return a.hora.localeCompare(b.hora);
            });
    },

    getTodasLasClasesPorDia: async (dia) => {
        const { data, error } = await supabase
            .from('clases')
            .select(`
                *,
                profesor:profesor_id ( id, nombre, apellido )
            `)
            .eq('dia_semana', dia)
            .order('hora', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getCantidadInscriptos: async (claseId, fechaClase) => {
        let query = supabase
            .from('inscripciones_clases')
            .select('*', { count: 'exact', head: true })
            .eq('clase_id', claseId)
            .eq('estado', 'inscripto');

        if (fechaClase) {
            query = query.eq('fecha_clase', fechaClase);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
    },

    getEstadoInscripcionAlumno: async (alumnoId, claseId, fechaClase) => {
        let query = supabase
            .from('inscripciones_clases')
            .select('*')
            .eq('alumno_id', alumnoId)
            .eq('clase_id', claseId);

        if (fechaClase) {
            query = query.eq('fecha_clase', fechaClase);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        return data;
    },

    getClasesParaAlumnoPorFecha: async (fechaClase, alumnoId) => {
        const dia = getDiaSemanaKey(fechaClase);
        const clases = await clasesService.getTodasLasClasesPorDia(dia);
        const clasesActivas = await clasesService.aplicarEstadoPorFecha(
            clases,
            fechaClase,
            true
        );

        if (!clasesActivas.length) return [];

        const clasesConDatos = await Promise.all(
            clasesActivas.map(async (clase) => {
                const cantidadInscriptos = await clasesService.getCantidadInscriptos(clase.id, fechaClase);
                const inscripcionAlumno = await clasesService.getEstadoInscripcionAlumno(alumnoId, clase.id, fechaClase);

                return armarClaseCard(clase, cantidadInscriptos, {
                    alumno_inscripto: inscripcionAlumno?.estado === 'inscripto',
                    fecha_clase: fechaClase,
                });
            })
        );

        return clasesConDatos;
    },

    getClasesParaEntrenadorPorFecha: async (fechaClase, profesorId) => {
        const dia = getDiaSemanaKey(fechaClase);
        const clases = await clasesService.getTodasLasClasesPorDiaYProfesor(dia, profesorId);
        const clasesActivas = await clasesService.aplicarEstadoPorFecha(
            clases,
            fechaClase,
            true
        );

        if (!clasesActivas.length) return [];

        const clasesConDatos = await Promise.all(
            clasesActivas.map(async (clase) => {
                const cantidadInscriptos = await clasesService.getCantidadInscriptos(clase.id, fechaClase);

                return armarClaseCard(clase, cantidadInscriptos, {
                    fecha_clase: fechaClase,
                });
            })
        );

        return clasesConDatos;
    },

    getClasesParaAdminPorFecha: async (fechaClase) => {
        const dia = getDiaSemanaKey(fechaClase);
        const clases = await clasesService.getTodasLasClasesPorDia(dia);
        const clasesConEstado = await clasesService.aplicarEstadoPorFecha(
            clases,
            fechaClase
        );

        if (!clasesConEstado.length) return [];

        const clasesConDatos = await Promise.all(
            clasesConEstado.map(async (clase) => {
                const cantidadInscriptos = await clasesService.getCantidadInscriptos(clase.id, fechaClase);

                return armarClaseCard(clase, cantidadInscriptos, {
                    activa: clase.activa,
                    activa_base: clase.activa_base,
                    tiene_excepcion_fecha: clase.tiene_excepcion_fecha,
                    fecha_clase: fechaClase,
                });
            })
        );

        return clasesConDatos;
    },

    getClasesParaAdminPorDia: async (dia) => {
        const clases = await clasesService.getTodasLasClasesPorDia(dia);

        if (!clases.length) return [];

        return Promise.all(
            clases.map(async (clase) => {
                const cantidadInscriptos = await clasesService.getCantidadInscriptos(clase.id, null);

                return armarClaseCard(clase, cantidadInscriptos, {
                    activa: clase.activa,
                });
            })
        );
    },

    getInscriptosDeClase: async (claseId, fechaClase) => {
        const { data, error } = await supabase
            .from('inscripciones_clases')
            .select(`
                id,
                estado,
                fecha_inscripcion,
                alumno:alumno_id (
                    id,
                    nombre,
                    apellido,
                    dni,
                    email,
                    telefono
                )
            `)
            .eq('clase_id', claseId)
            .eq('fecha_clase', fechaClase)
            .eq('estado', 'inscripto')
            .order('fecha_inscripcion', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getProfesores: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, nombre, apellido')
            .eq('rol', 'entrenador')
            .eq('estado', 'aprobado')
            .order('apellido', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getClaseById: async (claseId) => {
        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .eq('id', claseId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    updateClaseConValidaciones: async (claseId, updates) => {
        const claseActual = await clasesService.getClaseById(claseId);
        const cantidadInscriptos = await clasesService.getCantidadInscriptos(claseId);

        const hayInscriptos = cantidadInscriptos > 0;

        const cambioBloqueado =
            hayInscriptos &&
            (
                updates.dia_semana !== claseActual.dia_semana ||
                updates.hora !== claseActual.hora ||
                Number(updates.duracion) !== Number(claseActual.duracion) ||
                updates.profesor_id !== claseActual.profesor_id
            );

        if (cambioBloqueado) {
            throw new Error('HAY ALUMNO/S EN LA CLASE ELEGIDA');
        }

        if (
            updates.cupo_maximo !== undefined &&
            Number(updates.cupo_maximo) < cantidadInscriptos
        ) {
            throw new Error('HAY ALUMNO/S ANOTADOS FUERA DEL NUEVO CUPO');
        }

        const { error } = await supabase
            .from('clases')
            .update(updates)
            .eq('id', claseId);

        if (error) throw error;
    },

    createClase: async (claseData) => {
        const { error } = await supabase
            .from('clases')
            .insert([claseData]);

        if (error) throw error;
    },

    deleteClase: async (claseId) => {
        const { error } = await supabase
            .from('clases')
            .delete()
            .eq('id', claseId);

        if (error) throw error;
    },

    inscribirseAClase: async (alumnoId, claseId, fechaClase) => {
        const { error } = await supabase.rpc('inscribirse_a_clase_segura', {
            p_alumno_id: alumnoId,
            p_clase_id: claseId,
            p_fecha_clase: fechaClase,
        });

        if (error) {
            if (error.message?.includes('CLASE_COMPLETA')) {
                throw new Error('LA CLASE ESTA COMPLETA');
            }

            if (error.message?.includes('CLASE_INACTIVA')) {
                throw new Error('LA CLASE NO ESTA ACTIVA');
            }

            if (error.message?.includes('FECHA_INVALIDA')) {
                throw new Error('LA FECHA DE LA CLASE NO ES VALIDA');
            }

            if (error.message?.includes('CLASE_NO_ENCONTRADA')) {
                throw new Error('LA CLASE NO EXISTE');
            }

            if (error.message?.includes('USUARIO_NO_AUTORIZADO')) {
                throw new Error('NO TENES PERMISO PARA INSCRIBIRTE A ESTA CLASE');
            }

            if (error.message?.includes('CUOTA_NO_PAGA')) {
                throw new Error('TENES QUE TENER LA CUOTA AL DIA PARA INSCRIBIRTE');
            }

            throw error;
        }
    },

    cancelarInscripcion: async (alumnoId, claseId, fechaClase) => {
        const { error } = await supabase
            .from('inscripciones_clases')
            .delete()
            .eq('alumno_id', alumnoId)
            .eq('clase_id', claseId)
            .eq('fecha_clase', fechaClase);

        if (error) throw error;
    },

    toggleActivaClase: async (claseId, activa) => {
        const { error } = await supabase
            .from('clases')
            .update({ activa })
            .eq('id', claseId);

        if (error) throw error;
    },

    toggleActivaClaseEnFecha: async (claseId, fechaClase, activa) => {
        const { error } = await supabase
            .from('clases_excepciones')
            .upsert(
                [
                    {
                        clase_id: claseId,
                        fecha_clase: fechaClase,
                        activa,
                    },
                ],
                {
                    onConflict: 'clase_id,fecha_clase',
                }
            );

        if (error) throw error;
    },
    
};
