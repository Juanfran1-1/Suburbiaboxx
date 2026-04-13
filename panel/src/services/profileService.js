import { supabase } from '../lib/supabase';

const AVATAR_BUCKET = 'avatars';
const ARCHIVOS_BUCKET = 'archivos-alumno';
const CATEGORIAS_REEMPLAZABLES = ['ficha_medica', 'licencia', 'apto_fisico'];

function sanitizeFileName(name) {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .toLowerCase();
}

export const profileService = {
    // =========================
    // PROFILES
    // =========================
    getProfileById: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    getEmailByDni: async (dni) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('dni', dni.trim())
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    existsDni: async (dni) => {
        const { data } = await supabase
            .from('profiles')
            .select('dni')
            .eq('dni', dni.trim())
            .maybeSingle();

        return !!data;
    },

    existsEmail: async (email) => {
        const { data } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();

        return !!data;
    },

    createProfile: async (profileData) => {
        const { error } = await supabase
            .from('profiles')
            .insert([profileData]);

        if (error) throw error;
    },

    registrarUsuarioAdmin: async (payload) => {
        const dniLimpio = payload.dni.replace(/\D/g, '');
        const emailLimpio = payload.email.trim().toLowerCase();

        if (!payload.nombre.trim() || !payload.apellido.trim()) {
            throw new Error('NOMBRE Y APELLIDO SON OBLIGATORIOS');
        }

        if (!emailLimpio) {
            throw new Error('EMAIL OBLIGATORIO');
        }

        if (!/^[0-9]{7,9}$/.test(dniLimpio)) {
            throw new Error('DNI INVALIDO');
        }

        if (!payload.telefono.trim()) {
            throw new Error('TELEFONO OBLIGATORIO');
        }

        if (!payload.fecha_nacimiento) {
            throw new Error('FECHA DE NACIMIENTO OBLIGATORIA');
        }

        if (!['alumno', 'entrenador'].includes(payload.rol)) {
            throw new Error('ROL INVALIDO');
        }

        const emailExiste = await profileService.existsEmail(emailLimpio);
        if (emailExiste) {
            throw new Error('ESTE EMAIL YA ESTA REGISTRADO');
        }

        const dniExiste = await profileService.existsDni(dniLimpio);
        if (dniExiste) {
            throw new Error('ESTE DNI YA ESTA REGISTRADO');
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session?.access_token) {
            throw new Error('SESION ADMIN NO ENCONTRADA');
        }

        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/registrar-usuario-admin`;
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`,
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: payload.nombre.trim(),
                apellido: payload.apellido.trim(),
                email: emailLimpio,
                dni: dniLimpio,
                telefono: payload.telefono.trim(),
                fecha_nacimiento: payload.fecha_nacimiento,
                rol: payload.rol,
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.error || `ERROR EDGE FUNCTION ${response.status}`);
        }

        if (data?.error) throw new Error(data.error);
        if (data?.ok === false) throw new Error(data.error || 'NO SE PUDO REGISTRAR EL USUARIO');

        return data;
    },

    updateBasicProfile: async (userId, updates) => {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
    },

    updateAvatarUrl: async (userId, foto_url) => {
        const { error } = await supabase
            .from('profiles')
            .update({ foto_url })
            .eq('id', userId);

        if (error) throw error;
    },

    // =========================
    // DATOS ALUMNOS
    // =========================
    getDatosAlumno: async (userId) => {
        const { data, error } = await supabase
            .from('datos_alumnos')
            .select('*')
            .eq('alumno_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    },

    upsertDatosAlumno: async (userId, payload) => {
        const { error } = await supabase
            .from('datos_alumnos')
            .upsert(
                [
                    {
                        alumno_id: userId,
                        ...payload,
                    },
                ],
                {
                    onConflict: 'alumno_id',
                }
            );

        if (error) throw error;
    },

    // =========================
    // ARCHIVOS ALUMNO - DB
    // =========================
    getArchivosAlumno: async (userId) => {
        const { data, error } = await supabase
            .from('archivos_alumno')
            .select('*')
            .eq('alumno_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    getArchivoAlumnoById: async (archivoId) => {
        const { data, error } = await supabase
            .from('archivos_alumno')
            .select('*')
            .eq('id', archivoId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    getArchivoAlumnoByCategoria: async (userId, categoria) => {
        const { data, error } = await supabase
            .from('archivos_alumno')
            .select('*')
            .eq('alumno_id', userId)
            .eq('categoria', categoria)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    createArchivoAlumnoRecord: async (payload) => {
        const { error } = await supabase
            .from('archivos_alumno')
            .insert([payload]);

        if (error) throw error;
    },

    deleteArchivoAlumnoRecord: async (archivoId) => {
        const { error } = await supabase
            .from('archivos_alumno')
            .delete()
            .eq('id', archivoId);

        if (error) throw error;
    },

    // =========================
    // STORAGE - AVATAR
    // =========================
    uploadAvatar: async (userId, file, previousUrl = null) => {
        if (!file) {
            throw new Error('NO SE SELECCIONÓ NINGÚN ARCHIVO');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('FORMATO DE IMAGEN NO VÁLIDO');
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('LA IMAGEN SUPERA LOS 2MB');
        }

        const ext =
            file.type === 'image/png'
                ? 'png'
                : file.type === 'image/webp'
                ? 'webp'
                : 'jpg';

        const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from(AVATAR_BUCKET)
            .upload(filePath, file, {
                cacheControl: '0',
                contentType: file.type,
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(AVATAR_BUCKET)
            .getPublicUrl(filePath);

        if (!data?.publicUrl) {
            throw new Error('NO SE PUDO OBTENER LA URL DEL AVATAR');
        }

        await profileService.updateAvatarUrl(userId, data.publicUrl);

        if (previousUrl) {
            try {
                const url = new URL(previousUrl);
                const marker = `/object/public/${AVATAR_BUCKET}/`;
                const idx = url.pathname.indexOf(marker);

                if (idx !== -1) {
                    const oldPath = decodeURIComponent(
                        url.pathname.slice(idx + marker.length)
                    );

                    const { error: removeError } = await supabase.storage
                        .from(AVATAR_BUCKET)
                        .remove([oldPath]);

                    if (removeError) {
                        console.error('Error borrando avatar viejo:', removeError);
                    }
                }
            } catch (err) {
                console.error('No se pudo parsear la URL vieja del avatar:', err);
            }
        }

        return data.publicUrl;
    },

    // =========================
    // STORAGE - ARCHIVOS PRIVADOS
    // =========================
    getSignedUrlArchivo: async (storagePath) => {
        const { data, error } = await supabase.storage
            .from(ARCHIVOS_BUCKET)
            .createSignedUrl(storagePath, 60 * 5);

        if (error) throw error;
        return data?.signedUrl;
    },

    uploadArchivoAlumno: async (userId, file, categoria = 'otro') => {
        if (!file) {
            throw new Error('NO SE SELECCIONÓ NINGÚN ARCHIVO');
        }

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('TIPO DE ARCHIVO NO PERMITIDO');
        }

        const isPdf = file.type === 'application/pdf';
        const maxSize = isPdf ? 5 * 1024 * 1024 : 2 * 1024 * 1024;

        if (file.size > maxSize) {
            throw new Error(
                isPdf
                    ? 'EL PDF SUPERA LOS 5MB'
                    : 'LA IMAGEN SUPERA LOS 2MB'
            );
        }

        const safeName = sanitizeFileName(file.name);

        if (CATEGORIAS_REEMPLAZABLES.includes(categoria)) {
            const archivoExistente = await profileService.getArchivoAlumnoByCategoria(
                userId,
                categoria
            );

            if (archivoExistente) {
                if (archivoExistente.storage_path) {
                    const { error: removeError } = await supabase.storage
                        .from(ARCHIVOS_BUCKET)
                        .remove([archivoExistente.storage_path]);

                    if (removeError) throw removeError;
                }

                await profileService.deleteArchivoAlumnoRecord(archivoExistente.id);
            }
        }

        const filePath = `${userId}/${categoria}-${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from(ARCHIVOS_BUCKET)
            .upload(filePath, file, {
                contentType: file.type,
            });

        if (uploadError) throw uploadError;

        await profileService.createArchivoAlumnoRecord({
            alumno_id: userId,
            nombre: file.name,
            categoria,
            storage_path: filePath,
        });

        return filePath;
    },

    deleteArchivoAlumno: async (archivoId) => {
        const archivo = await profileService.getArchivoAlumnoById(archivoId);

        if (!archivo) {
            throw new Error('ARCHIVO NO ENCONTRADO');
        }

        if (archivo.storage_path) {
            const { error: storageError } = await supabase.storage
                .from(ARCHIVOS_BUCKET)
                .remove([archivo.storage_path]);

            if (storageError) throw storageError;
        }

        await profileService.deleteArchivoAlumnoRecord(archivoId);
    },

    // =========================
    // ADMIN / OTROS
    // =========================
    getUsersByRole: async (rol) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('rol', rol)
            .order('apellido', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getUsersByStatus: async (estado) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('estado', estado)
            .order('apellido', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getUsersByRoleAndStatus: async (rol, estado) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('rol', rol)
            .eq('estado', estado)
            .order('apellido', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    updateStatus: async (userId, estado) => {
        const { error } = await supabase
            .from('profiles')
            .update({ estado })
            .eq('id', userId);

        if (error) throw error;
    },

    getPlanillaAlumnoCompleta: async (userId) => {
        const [profile, datosAlumno, archivos] = await Promise.all([
            profileService.getProfileById(userId),
            profileService.getDatosAlumno(userId),
            profileService.getArchivosAlumno(userId),
        ]);

        return {
            profile: profile || null,
            datosAlumno: datosAlumno || null,
            archivos: archivos || [],
        };
    },

};
