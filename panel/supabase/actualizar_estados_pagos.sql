-- Cambia pagos a estados simples: pagado / vencido.
-- Los alumnos sin registro de pago se muestran como SIN CUOTA desde la app.

update public.pagos
set estado = 'vencido'
where estado = 'pendiente';

alter table public.pagos
drop constraint if exists pagos_estado_check;

alter table public.pagos
add constraint pagos_estado_check
check (estado in ('pagado', 'vencido'));
