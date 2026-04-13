import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContextBase';
import NavbarEntrenador from '../../components/Dashboard/NavBarEntrenador';
import { notify } from '../../components/SuburbiaToast';
import { profileService } from '../../services/profileService';
import { clasesService } from '../../services/clasesService';
import { compressAvatarImage } from '../../utils/imageCompressor';
import '../../styles/Dashboard.css';
import '../../styles/Perfil.css';

export default function PerfilEntrenador() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [clasesAsignadas, setClasesAsignadas] = useState([]);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
    });

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const clases = await clasesService.getClasesAsignadasProfesor(user.id);

                setClasesAsignadas(clases);
                setFormData({
                    nombre: profile?.nombre || '',
                    apellido: profile?.apellido || '',
                    dni: profile?.dni || '',
                    email: profile?.email || '',
                    telefono: profile?.telefono || '',
                });
                setAvatarUrl(
                    profile?.foto_url
                        ? `${profile.foto_url}?t=${Date.now()}`
                        : '/default-avatar.png'
                );
            } catch (error) {
                console.error(error);
                notify.error('ERROR CARGANDO PERFIL');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!user?.id) return;

        try {
            setSaving(true);

            await profileService.updateBasicProfile(user.id, {
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono,
            });

            notify.success('PERFIL ACTUALIZADO');
        } catch (error) {
            console.error(error);
            notify.error('ERROR GUARDANDO PERFIL');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        try {
            const file = e.target.files?.[0];
            if (!file || !user?.id) return;

            const compressedFile = await compressAvatarImage(file);
            const newUrl = await profileService.uploadAvatar(
                user.id,
                compressedFile,
                profile?.foto_url || null
            );

            setAvatarUrl(`${newUrl}?t=${Date.now()}`);
            notify.success('AVATAR ACTUALIZADO');

            window.location.reload();
        } catch (error) {
            console.error(error);
            notify.error(error.message || 'ERROR SUBIENDO AVATAR');
        } finally {
            e.target.value = '';
        }
    };

    if (loading) {
        return (
            <div className="dashboard-wrapper">
                <NavbarEntrenador />
                <div className="content-container">
                    <div className="perfil-container">
                        <div className="perfil-card">
                            <h2>CARGANDO PERFIL...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <NavbarEntrenador />

            <div className="content-container">
                <div className="perfil-container">
                    <h1 className="perfil-title">MI PERFIL</h1>

                    <div className="perfil-hero">
                        <div className="perfil-avatar-card">
                            <img
                                src={avatarUrl || '/default-avatar.png'}
                                alt="avatar"
                                className="perfil-avatar"
                            />

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                id="avatarEntrenadorInput"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />

                            <button
                                className="perfil-avatar-btn"
                                onClick={() =>
                                    document.getElementById('avatarEntrenadorInput')?.click()
                                }
                            >
                                CAMBIAR AVATAR
                            </button>
                        </div>

                        <div className="perfil-card">
                            <h2>DATOS PERSONALES</h2>

                            <div className="perfil-grid">
                                <div className="perfil-field">
                                    <label>NOMBRE</label>
                                    <input
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Nombre"
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label>APELLIDO</label>
                                    <input
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        placeholder="Apellido"
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label>DNI</label>
                                    <input name="dni" value={formData.dni} disabled />
                                </div>

                                <div className="perfil-field">
                                    <label>EMAIL</label>
                                    <input name="email" value={formData.email} disabled />
                                </div>

                                <div className="perfil-field">
                                    <label>TELEFONO</label>
                                    <input
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Telefono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="perfil-card">
                        <h2>CLASES ASIGNADAS</h2>

                        {clasesAsignadas.length > 0 ? (
                            <div className="trainer-class-list">
                                {clasesAsignadas.map((clase) => (
                                    <div key={clase.id} className="trainer-class-item">
                                        <strong>{clase.titulo || 'CLASE'}</strong>
                                        <span>
                                            {clase.dia_semana?.toUpperCase()} | {clase.hora} | {clase.duracion} MIN
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="perfil-empty-files">
                                TODAVIA NO TENES CLASES ASIGNADAS
                            </div>
                        )}
                    </div>

                    <button
                        className="perfil-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                </div>
            </div>
        </div>
    );
}
