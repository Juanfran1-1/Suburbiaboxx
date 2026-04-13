import { supabase } from '../lib/supabase';

const formatHora = (hora) => hora?.slice(0, 5) || '-';

const mapInscripcionClase = (item) => ({
    id: item.id,
    fecha: item.fecha_clase,
    estado: item.estado,
    titulo: item.clase?.titulo || 'CLASE',
    hora: formatHora(item.clase?.hora),
    duracion: item.clase?.duracion || '-',
    entrenador: item.clase?.profesor
        ? `${item.clase.profesor.nombre} ${item.clase.profesor.apellido}`
        : 'SIN ENTRENADOR',
});

const mapNota = (nota) => ({
    id: nota.id,
    autor_id: nota.autor_id,
    fecha: nota.fecha,
    tipo: nota.tipo,
    titulo: nota.titulo || 'OBSERVACION',
    nota: nota.nota,
    autor: nota.autor
        ? `${nota.autor.nombre} ${nota.autor.apellido}`
        : 'SIN AUTOR',
    tipo_autor: nota.tipo_autor,
});

export const progresoService = {
    getAlumnosParaAdmin: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, nombre, apellido, dni')
            .eq('rol', 'alumno')
            .eq('estado', 'aprobado')
            .order('apellido', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getAlumnosParaEntrenador: async (entrenadorId) => {
        const { data: clases, error: clasesError } = await supabase
            .from('clases')
            .select('id')
            .eq('profesor_id', entrenadorId);

        if (clasesError) throw clasesError;

        const claseIds = (clases || []).map((clase) => clase.id);
        if (!claseIds.length) return [];

        const { data: inscripciones, error: inscripcionesError } = await supabase
            .from('inscripciones_clases')
            .select(`
                alumno:alumno_id (
                    id,
                    nombre,
                    apellido,
                    dni
                )
            `)
            .in('clase_id', claseIds);

        if (inscripcionesError) throw inscripcionesError;

        const alumnosMap = new Map();
        (inscripciones || []).forEach((item) => {
            if (item.alumno?.id) {
                alumnosMap.set(item.alumno.id, item.alumno);
            }
        });

        return [...alumnosMap.values()].sort((a, b) =>
            `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
        );
    },

    getHistorialClasesAlumno: async (alumnoId) => {
        const { data, error } = await supabase
            .from('inscripciones_clases')
            .select(`
                id,
                fecha_clase,
                estado,
                clase:clase_id (
                    titulo,
                    hora,
                    duracion,
                    profesor:profesor_id (
                        nombre,
                        apellido
                    )
                )
            `)
            .eq('alumno_id', alumnoId)
            .eq('estado', 'inscripto')
            .order('fecha_clase', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapInscripcionClase);
    },

    getNotasAlumno: async (alumnoId) => {
        const { data, error } = await supabase
            .from('notas_progreso')
            .select(`
                id,
                fecha,
                tipo,
                titulo,
                nota,
                autor_id,
                tipo_autor,
                autor:autor_id (
                    nombre,
                    apellido
                )
            `)
            .eq('alumno_id', alumnoId)
            .order('fecha', { ascending: false })
            .order('creado_en', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapNota);
    },

    crearNota: async ({
        alumnoId,
        autorId,
        tipoAutor,
        tipo,
        titulo,
        nota,
        fecha,
    }) => {
        const { error } = await supabase
            .from('notas_progreso')
            .insert([
                {
                    alumno_id: alumnoId,
                    autor_id: autorId,
                    tipo_autor: tipoAutor,
                    tipo,
                    titulo: titulo?.trim() || null,
                    nota: nota.trim(),
                    fecha,
                },
            ]);

        if (error) throw error;
    },

    actualizarNota: async ({ notaId, tipo, titulo, nota, fecha }) => {
        const { error } = await supabase
            .from('notas_progreso')
            .update({
                tipo,
                titulo: titulo?.trim() || null,
                nota: nota.trim(),
                fecha,
            })
            .eq('id', notaId);

        if (error) throw error;
    },

    eliminarNota: async (notaId) => {
        const { error } = await supabase
            .from('notas_progreso')
            .delete()
            .eq('id', notaId);

        if (error) throw error;
    },
};
