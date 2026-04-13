-- Refuerzos de integridad y cupo seguro para Suburbia.
-- Ejecutar en Supabase SQL Editor.

create unique index if not exists profiles_email_unique
on public.profiles (lower(email));

create unique index if not exists profiles_dni_unique
on public.profiles (dni);

create unique index if not exists inscripciones_clases_alumno_clase_fecha_unique
on public.inscripciones_clases (alumno_id, clase_id, fecha_clase)
where fecha_clase is not null;

create unique index if not exists clases_excepciones_clase_fecha_unique
on public.clases_excepciones (clase_id, fecha_clase);

create or replace function public.inscribirse_a_clase_segura(
    p_alumno_id uuid,
    p_clase_id uuid,
    p_fecha_clase date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_cupo_maximo integer;
    v_activa boolean;
    v_ocupados integer;
    v_dia_fecha text;
    v_estado_existente text;
    v_alumno_habilitado boolean;
    v_cuota_habilitada boolean;
begin
    if auth.uid() is null or auth.uid() <> p_alumno_id then
        raise exception 'USUARIO_NO_AUTORIZADO';
    end if;

    select exists (
        select 1
        from public.profiles
        where id = p_alumno_id
            and rol = 'alumno'
            and estado = 'aprobado'
    )
    into v_alumno_habilitado;

    if not v_alumno_habilitado then
        raise exception 'USUARIO_NO_AUTORIZADO';
    end if;

    if p_fecha_clase is null or p_fecha_clase < current_date then
        raise exception 'FECHA_INVALIDA';
    end if;

    select exists (
        select 1
        from public.pagos p
        where p.alumno_id = p_alumno_id
            and p.estado = 'pagado'
            and make_date(
                case
                    when p.mes = 12 then p.anio + 1
                    else p.anio
                end,
                case
                    when p.mes = 12 then 1
                    else p.mes + 1
                end,
                10
            ) >= p_fecha_clase
    )
    into v_cuota_habilitada;

    if not v_cuota_habilitada then
        raise exception 'CUOTA_NO_PAGA';
    end if;

    v_dia_fecha :=
        case extract(dow from p_fecha_clase)
            when 0 then 'domingo'
            when 1 then 'lunes'
            when 2 then 'martes'
            when 3 then 'miercoles'
            when 4 then 'jueves'
            when 5 then 'viernes'
            when 6 then 'sabado'
        end;

    select
        c.cupo_maximo,
        coalesce(e.activa, c.activa)
    into
        v_cupo_maximo,
        v_activa
    from public.clases c
    left join public.clases_excepciones e
        on e.clase_id = c.id
        and e.fecha_clase = p_fecha_clase
    where c.id = p_clase_id
        and c.dia_semana = v_dia_fecha
    for update of c;

    if not found then
        raise exception 'CLASE_NO_ENCONTRADA';
    end if;

    if not v_activa then
        raise exception 'CLASE_INACTIVA';
    end if;

    select estado
    into v_estado_existente
    from public.inscripciones_clases
    where alumno_id = p_alumno_id
        and clase_id = p_clase_id
        and fecha_clase = p_fecha_clase;

    if v_estado_existente = 'inscripto' then
        return;
    end if;

    select count(*)
    into v_ocupados
    from public.inscripciones_clases
    where clase_id = p_clase_id
        and fecha_clase = p_fecha_clase
        and estado = 'inscripto';

    if v_ocupados >= v_cupo_maximo then
        raise exception 'CLASE_COMPLETA';
    end if;

    insert into public.inscripciones_clases (
        alumno_id,
        clase_id,
        fecha_clase,
        estado,
        fecha_inscripcion
    )
    values (
        p_alumno_id,
        p_clase_id,
        p_fecha_clase,
        'inscripto',
        now()
    )
    on conflict (alumno_id, clase_id, fecha_clase)
    where fecha_clase is not null
    do update set
        estado = 'inscripto',
        fecha_inscripcion = now();
end;
$$;

grant execute on function public.inscribirse_a_clase_segura(uuid, uuid, date) to authenticated;
