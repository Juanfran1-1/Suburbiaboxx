import { supabase } from '../lib/supabase';

const DIA_VENCIMIENTO = 10;

const formatPeriodo = (mes, anio) =>
    `${String(mes).padStart(2, '0')}/${anio}`;

const getPeriodoVencimiento = (mes, anio) => {
    const fecha = new Date(anio, mes, DIA_VENCIMIENTO);

    return {
        fecha,
        iso: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`,
        mes: fecha.getMonth() + 1,
        anio: fecha.getFullYear(),
        dia: fecha.getDate(),
    };
};

const formatFecha = (fecha) =>
    `${String(fecha.dia).padStart(2, '0')}/${String(fecha.mes).padStart(2, '0')}/${fecha.anio}`;

const formatFechaISO = (fechaISO) => {
    if (!fechaISO) return '-';

    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
};

const formatEstadoPago = (estado) => {
    const labels = {
        pagado: 'PAGADO',
        vencido: 'VENCIDO',
        sin_cuota: 'SIN CUOTA',
    };

    return labels[estado] || estado?.toUpperCase() || '-';
};

const getPeriodoActual = () => {
    const hoy = new Date();
    return {
        mes: hoy.getMonth() + 1,
        anio: hoy.getFullYear(),
    };
};

const normalizarPago = (pago, mes, anio, plan, promoInfo = null) => {
    if (pago) {
        return {
            ...pago,
            estado_visual: pago.estado,
        };
    }

    const precioBase = Number(plan?.precio || 0);
    const descuento = calcularDescuento(precioBase, promoInfo?.promo, true);

    return {
        id: null,
        mes,
        anio,
        precio_base: precioBase,
        descuento_tipo: promoInfo?.promo?.tipo_descuento || null,
        descuento_valor: promoInfo?.promo?.valor_descuento || 0,
        total: Math.max(precioBase - descuento, 0),
        estado: 'sin_cuota',
        estado_visual: 'sin_cuota',
        metodo_pago: null,
        fecha_pago: null,
        nota: '',
    };
};

const calcularDescuento = (precioBase, promo, aplicarDescuento = true) => {
    if (!promo || !aplicarDescuento) return 0;

    const valor = Number(promo.valor_descuento || 0);

    if (promo.tipo_descuento === 'porcentaje') {
        return (precioBase * valor) / 100;
    }

    if (promo.tipo_descuento === 'monto_fijo') {
        return valor;
    }

    if (promo.tipo_descuento === 'precio_final') {
        return Math.max(precioBase - valor, 0);
    }

    return 0;
};

const calcularTotal = (precioBase, promo, aplicarDescuento = true) => {
    const descuento = calcularDescuento(precioBase, promo, aplicarDescuento);
    return Math.max(Number(precioBase || 0) - descuento, 0);
};

const getPromoActivaPorAlumno = async (alumnoIds) => {
    if (!alumnoIds.length) return new Map();

    const { data: promoAlumnos, error } = await supabase
        .from('promos_alumnos')
        .select('id, alumno_id, promo_grupo_id, activa')
        .in('alumno_id', alumnoIds)
        .eq('activa', true);

    if (error) throw error;
    if (!promoAlumnos?.length) return new Map();

    const grupoIds = [...new Set(promoAlumnos.map((item) => item.promo_grupo_id))];
    if (!grupoIds.length) return new Map();

    const { data: grupos, error: gruposError } = await supabase
        .from('promos_grupos')
        .select('id, promo_id, nombre, activa')
        .in('id', grupoIds);

    if (gruposError) throw gruposError;

    const promoIds = [...new Set((grupos || []).map((grupo) => grupo.promo_id))];
    if (!promoIds.length) return new Map();

    const { data: promos, error: promosError } = await supabase
        .from('promos')
        .select('*')
        .in('id', promoIds);

    if (promosError) throw promosError;

    const { data: integrantes, error: integrantesError } = await supabase
        .from('promos_alumnos')
        .select('promo_grupo_id, alumno_id, activa')
        .in('promo_grupo_id', grupoIds)
        .eq('activa', true);

    if (integrantesError) throw integrantesError;

    const integranteIds = [...new Set((integrantes || []).map((item) => item.alumno_id))];
    const { data: perfiles, error: perfilesError } = await supabase
        .from('profiles')
        .select('id, nombre, apellido')
        .in('id', integranteIds);

    if (perfilesError) throw perfilesError;

    const grupoMap = new Map((grupos || []).map((grupo) => [grupo.id, grupo]));
    const promoMap = new Map((promos || []).map((promo) => [promo.id, promo]));
    const perfilMap = new Map((perfiles || []).map((perfil) => [perfil.id, perfil]));

    const integrantesPorGrupo = new Map();
    (integrantes || []).forEach((integrante) => {
        const lista = integrantesPorGrupo.get(integrante.promo_grupo_id) || [];
        lista.push({
            alumno_id: integrante.alumno_id,
            profile: perfilMap.get(integrante.alumno_id) || null,
        });
        integrantesPorGrupo.set(integrante.promo_grupo_id, lista);
    });

    return new Map(
        promoAlumnos.map((promoAlumno) => {
            const grupo = grupoMap.get(promoAlumno.promo_grupo_id) || null;
            return [
                promoAlumno.alumno_id,
                {
                    ...promoAlumno,
                    grupo,
                    promo: grupo ? promoMap.get(grupo.promo_id) : null,
                    integrantes: integrantesPorGrupo.get(promoAlumno.promo_grupo_id) || [],
                },
            ];
        })
    );
};

const getPlanesPorAlumno = async (alumnoIds) => {
    if (!alumnoIds.length) return new Map();

    const { data, error } = await supabase
        .from('planes_alumnos')
        .select(`
            alumno_id,
            plan:plan_id (
                id,
                nombre,
                clases_por_semana,
                precio,
                activo
            )
        `)
        .in('alumno_id', alumnoIds)
        .eq('activo', true);

    if (error) throw error;

    return new Map((data || []).map((item) => [item.alumno_id, item.plan]));
};

const getPagosPorAlumno = async (alumnoIds, mes, anio) => {
    if (!alumnoIds.length) return new Map();

    const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .in('alumno_id', alumnoIds)
        .eq('mes', mes)
        .eq('anio', anio);

    if (error) throw error;

    return new Map((data || []).map((pago) => [pago.alumno_id, pago]));
};

const getPromo2x1 = async () => {
    const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('nombre', '2x1 amigo')
        .eq('activa', true)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const pagosService = {
    getPeriodoActual,
    getPeriodoVencimiento,
    formatFecha,
    formatFechaISO,
    formatEstadoPago,
    formatPeriodo,
    calcularTotal,

    getPlanes: async () => {
        const { data, error } = await supabase
            .from('planes')
            .select('*')
            .eq('activo', true)
            .order('clases_por_semana', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getResumenPagosAdmin: async (mes, anio) => {
        const { data: alumnos, error } = await supabase
            .from('profiles')
            .select('id, nombre, apellido, dni, email')
            .eq('rol', 'alumno')
            .eq('estado', 'aprobado')
            .order('apellido', { ascending: true });

        if (error) throw error;

        const alumnoIds = (alumnos || []).map((alumno) => alumno.id);
        const [planesMap, pagosMap, promosMap] = await Promise.all([
            getPlanesPorAlumno(alumnoIds),
            getPagosPorAlumno(alumnoIds, mes, anio),
            getPromoActivaPorAlumno(alumnoIds),
        ]);

        return (alumnos || []).map((alumno) => {
            const plan = planesMap.get(alumno.id) || null;
            const promoInfo = promosMap.get(alumno.id) || null;
            const pago = normalizarPago(
                pagosMap.get(alumno.id),
                mes,
                anio,
                plan,
                promoInfo
            );

            const companeros = (promoInfo?.integrantes || []).filter(
                (item) => item.alumno_id !== alumno.id
            );

            const promoEnRiesgo = companeros.some((compa) => {
                const pagoCompa = pagosMap.get(compa.alumno_id);
                return !pagoCompa || pagoCompa.estado !== 'pagado';
            });

            return {
                alumno,
                plan,
                pago,
                promoInfo,
                companeros,
                promoEnRiesgo,
            };
        });
    },

    getPagosAlumno: async (alumnoId) => {
        const periodo = getPeriodoActual();
        const [planesMap, promosMap] = await Promise.all([
            getPlanesPorAlumno([alumnoId]),
            getPromoActivaPorAlumno([alumnoId]),
        ]);

        const plan = planesMap.get(alumnoId) || null;
        const promoInfo = promosMap.get(alumnoId) || null;

        const { data: pagos, error } = await supabase
            .from('pagos')
            .select(`
                *,
                plan:plan_id (
                    nombre
                )
            `)
            .eq('alumno_id', alumnoId)
            .order('anio', { ascending: false })
            .order('mes', { ascending: false });

        if (error) throw error;

        const pagoActualDb = (pagos || []).find(
            (pago) => pago.mes === periodo.mes && pago.anio === periodo.anio
        );

        const pagoActual = normalizarPago(
            pagoActualDb,
            periodo.mes,
            periodo.anio,
            plan,
            promoInfo
        );

        return {
            plan,
            promoInfo,
            pagoActual,
            historial: pagos || [],
        };
    },

    getHistorialAlumno: async (alumnoId) => {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
                *,
                plan:plan_id (
                    nombre
                )
            `)
            .eq('alumno_id', alumnoId)
            .order('anio', { ascending: false })
            .order('mes', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    asignarPlan: async (alumnoId, planId) => {
        const { error } = await supabase
            .from('planes_alumnos')
            .upsert(
                [
                    {
                        alumno_id: alumnoId,
                        plan_id: planId,
                        activo: true,
                    },
                ],
                { onConflict: 'alumno_id' }
            );

        if (error) throw error;
    },

    aplicarPromo2x1: async (alumnoId, companeroId) => {
        const promo = await getPromo2x1();
        if (!promo) throw new Error('NO SE ENCONTRO LA PROMO 2X1');

        const alumnoIds = [alumnoId, companeroId];

        const { data: activas, error: activasError } = await supabase
            .from('promos_alumnos')
            .select('id')
            .in('alumno_id', alumnoIds)
            .eq('activa', true);

        if (activasError) throw activasError;

        if (activas?.length) {
            const { error: updateError } = await supabase
                .from('promos_alumnos')
                .update({ activa: false })
                .in(
                    'id',
                    activas.map((item) => item.id)
                );

            if (updateError) throw updateError;
        }

        const { data: grupo, error: grupoError } = await supabase
            .from('promos_grupos')
            .insert([
                {
                    promo_id: promo.id,
                    nombre: '2x1 amigo',
                    activa: true,
                },
            ])
            .select('id')
            .single();

        if (grupoError) throw grupoError;

        const { error: integrantesError } = await supabase
            .from('promos_alumnos')
            .insert(
                alumnoIds.map((id) => ({
                    promo_grupo_id: grupo.id,
                    alumno_id: id,
                    activa: true,
                }))
            );

        if (integrantesError) throw integrantesError;
    },

    quitarPromo: async (promoGrupoId) => {
        const { error: integrantesError } = await supabase
            .from('promos_alumnos')
            .update({ activa: false })
            .eq('promo_grupo_id', promoGrupoId);

        if (integrantesError) throw integrantesError;

        const { error: grupoError } = await supabase
            .from('promos_grupos')
            .update({ activa: false })
            .eq('id', promoGrupoId);

        if (grupoError) throw grupoError;
    },

    registrarPago: async ({
        alumnoId,
        plan,
        promoInfo,
        mes,
        anio,
        metodoPago,
        fechaPago,
        nota,
        aplicarDescuento,
    }) => {
        const precioBase = Number(plan?.precio || 0);
        const promo = promoInfo?.promo || null;
        const total = calcularTotal(precioBase, promo, aplicarDescuento);

        if (plan?.id) {
            await pagosService.asignarPlan(alumnoId, plan.id);
        }

        const { error } = await supabase
            .from('pagos')
            .upsert(
                [
                    {
                        alumno_id: alumnoId,
                        plan_id: plan?.id || null,
                        promo_id: aplicarDescuento ? promo?.id || null : null,
                        promo_grupo_id: aplicarDescuento
                            ? promoInfo?.promo_grupo_id || null
                            : null,
                        mes,
                        anio,
                        precio_base: precioBase,
                        descuento_tipo: aplicarDescuento
                            ? promo?.tipo_descuento || null
                            : null,
                        descuento_valor: aplicarDescuento
                            ? promo?.valor_descuento || 0
                            : 0,
                        total,
                        estado: 'pagado',
                        metodo_pago: metodoPago,
                        fecha_pago: fechaPago,
                        nota: nota?.trim() || null,
                    },
                ],
                { onConflict: 'alumno_id,mes,anio' }
            );

        if (error) throw error;
    },

    marcarVencido: async ({ alumnoId, plan, promoInfo, mes, anio }) => {
        const precioBase = Number(plan?.precio || 0);
        const promo = promoInfo?.promo || null;
        const total = calcularTotal(precioBase, promo, true);

        const { error } = await supabase
            .from('pagos')
            .upsert(
                [
                    {
                        alumno_id: alumnoId,
                        plan_id: plan?.id || null,
                        promo_id: promo?.id || null,
                        promo_grupo_id: promoInfo?.promo_grupo_id || null,
                        mes,
                        anio,
                        precio_base: precioBase,
                        descuento_tipo: promo?.tipo_descuento || null,
                        descuento_valor: promo?.valor_descuento || 0,
                        total,
                        estado: 'vencido',
                        metodo_pago: null,
                        fecha_pago: null,
                        nota: null,
                    },
                ],
                { onConflict: 'alumno_id,mes,anio' }
            );

        if (error) throw error;
    },
};
