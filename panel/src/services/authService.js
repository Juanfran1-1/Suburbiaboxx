import { supabase } from '../lib/supabase';
import { profileService } from './profileService';

export const authService = {

    registerUser: async (formData) => {
        const dniIngresado = formData.dni.trim();
        const emailIngresado = formData.email.trim().toLowerCase();
        const soloNumerosRegex = /^[0-9]+$/;

        // Validaciones
        if (!soloNumerosRegex.test(dniIngresado)) {
            throw new Error("DNI INVÁLIDO.");
        }

        if (dniIngresado.length < 7 || dniIngresado.length > 9) {
            throw new Error("DNI INVÁLIDO.");
        }

        // 👇 USA SERVICE
        const dniExists = await profileService.existsDni(dniIngresado);
        if (dniExists) {
            throw new Error("ESTE DNI YA ESTÁ REGISTRADO.");
        }

        const emailExists = await profileService.existsEmail(emailIngresado);
        if (emailExists) {
            throw new Error("ESTE EMAIL YA ESTÃ REGISTRADO.");
        }

        // Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailIngresado,
            password: formData.password,
        });

        if (authError) {
            if (authError.message.includes("already registered")) {
                throw new Error("ESTE EMAIL YA ESTÁ REGISTRADO.");
            }
            throw authError;
        }

        // Crear perfil
        if (authData?.user) {
            await profileService.createProfile({
                id: authData.user.id,
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: emailIngresado,
                telefono: formData.telefono,
                dni: formData.dni.trim(),
                fecha_nacimiento: formData.fecha_nacimiento,
                experiencia: formData.experiencia,
                rol: 'alumno',
                estado: 'pendiente'
            });
        }

        return authData;
    },

    loginUser: async (identifier, password) => {
        let emailToAuth = identifier.trim().toLowerCase();

        // 👇 BUSCAR EMAIL POR DNI
        if (!emailToAuth.includes('@')) {
            const profileByDni = await profileService.getEmailByDni(identifier);

            if (!profileByDni) {
                throw new Error("NO EXISTE ESE DNI.");
            }

            emailToAuth = profileByDni.email;
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: emailToAuth,
            password,
        });

        if (authError) {
            throw new Error("CREDENCIALES INCORRECTAS.");
        }

        // 👇 TRAER PERFIL
        const profile = await profileService.getProfileById(authData.user.id);

        if (!profile) {
            throw new Error("NO SE ENCONTRÓ EL PERFIL.");
        }

        if (profile.estado === 'pendiente') {
            await supabase.auth.signOut();
            throw new Error("CUENTA PENDIENTE.");
        }

        if (profile.estado === 'dado_de_baja') {
            await supabase.auth.signOut();
            throw new Error("CUENTA DADA DE BAJA.");
        }

        return { user: authData.user, profile };
    },

    sendPasswordReset: async (email) => {
        const emailLimpio = email.trim().toLowerCase();

        // 👇 USA SERVICE
        const exists = await profileService.existsEmail(emailLimpio);

        if (!exists) {
            throw new Error("EMAIL NO REGISTRADO.");
        }

        const { error } = await supabase.auth.resetPasswordForEmail(emailLimpio, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) throw error;
    },

    updatePassword: async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
    },

};
