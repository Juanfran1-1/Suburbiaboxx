import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    // loading = solo para saber si ya restauramos la sesión inicial
    const [loading, setLoading] = useState(true);

    const getProfile = async (userId) => {
        try {
            const data = await profileService.getProfileById(userId);
            return data ?? null;
        } catch (error) {
            console.error('Error en getProfile:', error);
            return null;
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                setLoading(true);

                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getSession:', error);
                    if (mounted) {
                        setUser(null);
                        setProfile(null);
                    }
                    return;
                }

                if (!mounted) return;

                const sessionUser = session?.user ?? null;
                setUser(sessionUser);

                // Bajamos loading apenas sabemos la sesión
                setLoading(false);

                // El perfil lo cargamos aparte, sin congelar toda la app
                if (sessionUser) {
                    const profileData = await getProfile(sessionUser.id);
                    if (mounted) {
                        setProfile(profileData);
                    }
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error('Error inicializando auth:', err);
                if (mounted) {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
            }
        };

        initAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {

            const sessionUser = session?.user ?? null;
            setUser(sessionUser);

            // Nunca dejes loading clavado
            setLoading(false);

            if (sessionUser) {
                getProfile(sessionUser.id).then((profileData) => {
                    if (mounted) {
                        setProfile(profileData);
                    }
                });
            } else {
                setProfile(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                authenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
