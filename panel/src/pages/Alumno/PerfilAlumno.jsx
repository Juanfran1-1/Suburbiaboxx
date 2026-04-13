import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContextBase';
import { profileService } from '../../services/profileService';
import NavbarAlumno from '../../components/Dashboard/NavbarAlumno';
import { notify } from '../../components/SuburbiaToast';
import { compressAvatarImage } from '../../utils/imageCompressor';
import '../../styles/Dashboard.css';
import '../../styles/Perfil.css';

export default function MiPerfilAlumno() {
    const { user, profile } = useAuth();
    const [categoriaArchivo, setCategoriaArchivo] = useState('otro');

    const [archivos, setArchivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        peso: '',
        altura: '',
        lesiones_previas: '',
        medicacion: '',
        obra_social: '',
        contacto_nombre: '',
        contacto_vinculo: '',
        contacto_telefono: '',
        contacto_observaciones: '',
    });

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                const data = await profileService.getDatosAlumno(user.id);
                const archivosData = await profileService.getArchivosAlumno(user.id);

                setArchivos(archivosData || []);

                setFormData({
                    nombre: profile?.nombre || '',
                    apellido: profile?.apellido || '',
                    dni: profile?.dni || '',
                    email: profile?.email || '',
                    telefono: profile?.telefono || '',
                    peso: data?.peso || '',
                    altura: data?.altura || '',
                    lesiones_previas: data?.lesiones_previas || '',
                    medicacion: data?.medicacion || '',
                    obra_social: data?.obra_social || '',
                    contacto_nombre: data?.contacto_nombre || '',
                    contacto_vinculo: data?.contacto_vinculo || '',
                    contacto_telefono: data?.contacto_telefono || '',
                    contacto_observaciones: data?.contacto_observaciones || '',
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

            await profileService.upsertDatosAlumno(user.id, {
                peso: formData.peso,
                altura: formData.altura,
                lesiones_previas: formData.lesiones_previas,
                medicacion: formData.medicacion,
                obra_social: formData.obra_social,
                contacto_nombre: formData.contacto_nombre,
                contacto_vinculo: formData.contacto_vinculo,
                contacto_telefono: formData.contacto_telefono,
                contacto_observaciones: formData.contacto_observaciones,
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

    const handleArchivoUpload = async (e) => {
        try {
            const file = e.target.files?.[0];
            if (!file || !user?.id) return;

            await profileService.uploadArchivoAlumno(user.id, file, categoriaArchivo);
            notify.success('ARCHIVO SUBIDO');

            const nuevos = await profileService.getArchivosAlumno(user.id);
            setArchivos(nuevos || []);
        } catch (error) {
            console.error(error);
            notify.error(error.message || 'ERROR SUBIENDO ARCHIVO');
        } finally {
            e.target.value = '';
        }
    };

    const handleDeleteArchivo = async (archivoId) => {
        try {
            await profileService.deleteArchivoAlumno(archivoId);
            notify.success('ARCHIVO ELIMINADO');

            setArchivos((prev) => prev.filter((x) => x.id !== archivoId));
        } catch (error) {
            console.error(error);
            notify.error(error.message || 'ERROR ELIMINANDO ARCHIVO');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-wrapper">
                <NavbarAlumno />
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
            <NavbarAlumno />

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
                                id="avatarInput"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />

                            <button
                                className="perfil-avatar-btn"
                                onClick={() =>
                                    document.getElementById('avatarInput')?.click()
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
                                    <input
                                        name="dni"
                                        value={formData.dni}
                                        disabled
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label>EMAIL</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label>TELÉFONO</label>
                                    <input
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Teléfono"
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label>PESO</label>
                                    <input
                                        name="peso"
                                        value={formData.peso}
                                        onChange={handleChange}
                                        placeholder="Ej: 78"
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label>ALTURA</label>
                                    <input
                                        name="altura"
                                        value={formData.altura}
                                        onChange={handleChange}
                                        placeholder="Ej: 1.75 o 175"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="perfil-card">
                        <h2>DATOS DE TERCERO</h2>

                        <div className="perfil-grid">
                            <div className="perfil-field">
                                <label>NOMBRE</label>
                                <input
                                    name="contacto_nombre"
                                    value={formData.contacto_nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre del contacto"
                                />
                            </div>

                            <div className="perfil-field">
                                <label>VÍNCULO</label>
                                <input
                                    name="contacto_vinculo"
                                    value={formData.contacto_vinculo}
                                    onChange={handleChange}
                                    placeholder="Ej: Madre, Padre, Hermano"
                                />
                            </div>

                            <div className="perfil-field">
                                <label>TELÉFONO</label>
                                <input
                                    name="contacto_telefono"
                                    value={formData.contacto_telefono}
                                    onChange={handleChange}
                                    placeholder="Teléfono del contacto"
                                />
                            </div>

                            <div className="perfil-field full">
                                <label>OBSERVACIONES</label>
                                <textarea
                                    name="contacto_observaciones"
                                    value={formData.contacto_observaciones}
                                    onChange={handleChange}
                                    placeholder="Observaciones del contacto"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="perfil-card">
                        <h2>SALUD</h2>

                        <div className="perfil-grid">
                            <div className="perfil-field full">
                                <label>LESIONES PREVIAS</label>
                                <textarea
                                    name="lesiones_previas"
                                    value={formData.lesiones_previas}
                                    onChange={handleChange}
                                    placeholder="Describí lesiones previas"
                                />
                            </div>

                            <div className="perfil-field full">
                                <label>MEDICACIÓN</label>
                                <textarea
                                    name="medicacion"
                                    value={formData.medicacion}
                                    onChange={handleChange}
                                    placeholder="Medicación actual o relevante"
                                />
                            </div>

                            <div className="perfil-field">
                                <label>OBRA SOCIAL</label>
                                <input
                                    name="obra_social"
                                    value={formData.obra_social}
                                    onChange={handleChange}
                                    placeholder="Obra social"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="perfil-card">
                        <div className="perfil-archivos-header">
                            <h2>ARCHIVOS</h2>

                            <div className="perfil-archivos-actions">
                                <select
                                    className="perfil-upload-input"
                                    value={categoriaArchivo}
                                    onChange={(e) => setCategoriaArchivo(e.target.value)}
                                >
                                    <option value="ficha_medica">FICHA MÉDICA</option>
                                    <option value="licencia">LICENCIA</option>
                                    <option value="apto_fisico">APTO FÍSICO</option>
                                    <option value="estudio">ESTUDIO</option>
                                    <option value="otro">OTRO</option>
                                </select>

                                <input
                                    className="perfil-upload-input"
                                    type="file"
                                    accept=".pdf,image/png,image/jpeg,image/webp"
                                    onChange={handleArchivoUpload}
                                />
                            </div>
                        </div>

                        <div className="archivos-list">
                            {archivos.length > 0 ? (
                                archivos.map((archivo) => (
                                    <div key={archivo.id} className="archivo-item">
                                        <div className="archivo-main">
                                            <span className="archivo-icon">📄</span>
                                            <div>
                                                <div className="archivo-nombre">{archivo.nombre}</div>
                                                <div className="archivo-categoria">
                                                    {archivo.categoria?.replace('_', ' ').toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="archivo-actions">
                                            <button
                                                className="archivo-delete-btn"
                                                onClick={async () => {
                                                    try {
                                                        const signedUrl =
                                                            await profileService.getSignedUrlArchivo(
                                                                archivo.storage_path
                                                            );

                                                        if (signedUrl) {
                                                            window.open(signedUrl, '_blank');
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                        notify.error('NO SE PUDO ABRIR EL ARCHIVO');
                                                    }
                                                }}
                                            >
                                                VER
                                            </button>

                                            <button
                                                className="archivo-delete-btn"
                                                onClick={() => handleDeleteArchivo(archivo.id)}
                                            >
                                                ELIMINAR
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="perfil-empty-files">
                                    TODAVÍA NO SUBISTE ARCHIVOS
                                </div>
                            )}
                        </div>
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
