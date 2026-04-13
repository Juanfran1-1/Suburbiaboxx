import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    });
}

function appError(error: string) {
    return jsonResponse({ ok: false, error });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return appError('METODO_NO_PERMITIDO');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
        return appError('CONFIGURACION_INCOMPLETA');
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
    });

    const {
        data: { user },
        error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
        return appError('NO_AUTORIZADO');
    }

    const { data: adminProfile, error: adminProfileError } = await userClient
        .from('profiles')
        .select('rol, estado')
        .eq('id', user.id)
        .maybeSingle();

    if (adminProfileError || adminProfile?.rol !== 'admin' || adminProfile?.estado !== 'aprobado') {
        return appError('SOLO_ADMIN');
    }

    const payload = await req.json().catch(() => null);

    if (!payload) {
        return appError('DATOS_INVALIDOS');
    }

    const nombre = String(payload.nombre ?? '').trim();
    const apellido = String(payload.apellido ?? '').trim();
    const email = String(payload.email ?? '').trim().toLowerCase();
    const telefono = String(payload.telefono ?? '').trim();
    const dni = String(payload.dni ?? '').replace(/\D/g, '');
    const fechaNacimiento = String(payload.fecha_nacimiento ?? '').trim();
    const rol = String(payload.rol ?? '').trim();

    if (!nombre || !apellido || !email || !telefono || !fechaNacimiento) {
        return appError('FALTAN_DATOS');
    }

    if (!/^[0-9]{7,9}$/.test(dni)) {
        return appError('DNI_INVALIDO');
    }

    if (!['alumno', 'entrenador'].includes(rol)) {
        return appError('ROL_INVALIDO');
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: emailExistente, error: emailError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (emailError) {
        return appError('ERROR_VALIDANDO_EMAIL');
    }

    if (emailExistente) {
        return appError('ESTE_EMAIL_YA_ESTA_REGISTRADO');
    }

    const { data: dniExistente, error: dniError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('dni', dni)
        .maybeSingle();

    if (dniError) {
        return appError('ERROR_VALIDANDO_DNI');
    }

    if (dniExistente) {
        return appError('ESTE_DNI_YA_ESTA_REGISTRADO');
    }

    const origin = req.headers.get('Origin') ?? '';
    const redirectTo = origin ? `${origin}/update-password` : undefined;

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        {
            data: {
                nombre,
                apellido,
                rol,
            },
            redirectTo,
        },
    );

    if (inviteError || !inviteData?.user?.id) {
        return appError(inviteError?.message ?? 'NO_SE_PUDO_CREAR_EL_USUARIO');
    }

    const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
            id: inviteData.user.id,
            nombre,
            apellido,
            email,
            telefono,
            dni,
            fecha_nacimiento: fechaNacimiento,
            rol,
            estado: 'aprobado',
        });

    if (profileError) {
        await adminClient.auth.admin.deleteUser(inviteData.user.id);
        return appError(profileError.message);
    }

    return jsonResponse({
        ok: true,
        userId: inviteData.user.id,
    });
});
