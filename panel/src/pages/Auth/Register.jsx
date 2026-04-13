// src/pages/Register.jsx
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/AuthInput';
import BackButton from '../../components/BackButton';
import '../../styles/Register.css'; 
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { useState } from 'react'
import { authService } from '../../services/authService'; 
import { notify } from '../../components/SuburbiaToast'; 
import logoSuburbia from '../../assets/logo-suburbia.jpg';

const Register = () => {
    const navigate = useNavigate();
    
    // 1. Estados
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        dni: '',
        email: '',
        password: '',
        confirmPassword: '',
        experiencia: ''
    });
    
    const [phone, setPhone] = useState();
    const [showPasswords, setShowPasswords] = useState(false);

    // 2. Manejadores
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleAllPasswords = () => {
        setShowPasswords(!showPasswords);
    };

    // 3. Envío al Ring (Supabase)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- VALIDACIONES DE DEFENSA ---
        if (formData.password !== formData.confirmPassword) {
            return notify.error("LAS CONTRASEÑAS NO COINCIDEN");
        }

        if (formData.password.length < 8) {
            return notify.error("LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES");
        }

        if (!phone) {
            return notify.error("EL TELÉFONO ES OBLIGATORIO");
        }

        const dniLimpio = formData.dni.replace(/\D/g, '');

        const hoy = new Date();
        const cumple = new Date(formData.fecha_nacimiento);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (edad < 5) {
            return notify.error("DEBES SER MAYOR DE 5 AÑOS PARA REGISTRARTE");
        }

        setIsLoading(true); // Bloqueamos el formulario

        try {
            // Combinamos los datos con el teléfono formateado
            const fullData = { 
                ...formData, 
                dni: dniLimpio, 
                telefono: phone 
            };
            
            await authService.registerUser(fullData);
            
            notify.success("¡REGISTRO EXITOSO! ESPERÁ TU APROBACIÓN.");
            
            // Redirigimos al login después de un breve delay para que vean el mensaje
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
        // Manejo de errores específicos para que el alumno entienda qué pasó
        if (error.message.includes("already registered")) {
            notify.error("ESTE EMAIL YA TIENE UNA CUENTA.");
        } else {
            notify.error(error.message.toUpperCase());
        }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page auth-page-layout">
            <BackButton />

            <div className="auth-card register-card fade-in">
                <div className="register-header">
                    <img src={logoSuburbia} alt="Logo" className="mini-logo" />
                    <div className="auth-header"><h1>Registrarse</h1></div>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <AuthInput label="NOMBRE" name="nombre" placeholder="Ej: Ángel" onChange={handleChange} required disabled={isLoading} />
                        <AuthInput label="APELLIDO" name="apellido" placeholder="Ej: Romero" onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-row">
                        <AuthInput label="FECHA DE NACIMIENTO" name="fecha_nacimiento" type="date" onChange={handleChange} required disabled={isLoading} />
                        <AuthInput label="DNI" name="dni" placeholder="Sin puntos" onChange={handleChange} required disabled={isLoading} />
                    </div>
                    
                    <AuthInput 
                        label="EMAIL" 
                        name="email" 
                        type="email" 
                        placeholder="mail@ejemplo.com" 
                        onChange={handleChange} 
                        required 
                        disabled={isLoading}
                    />
                    
                    <div className="input-group">
                        <label>TELÉFONO / WHATSAPP</label>
                        <PhoneInput
                            international
                            defaultCountry="AR"
                            value={phone}
                            onChange={setPhone}
                            placeholder="11 2345-6789"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>EXPERIENCIA EN BOXEO</label>
                        <select 
                            className="select-experience" 
                            name="experiencia"
                            required 
                            defaultValue=""
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="" disabled>Seleccioná una opción</option>
                            <option value="Sin experiencia">No tengo experiencia</option>
                            <option value="1-3">1 a 3 años</option>
                            <option value="4+">4 o más años</option>
                        </select>
                    </div>

                    <AuthInput 
                        label="CONTRASEÑA" 
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        isPasswordVisible={showPasswords}
                        toggleVisibility={toggleAllPasswords}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    
                    <AuthInput 
                        label="REPETIR CONTRASEÑA" 
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        isPasswordVisible={showPasswords}
                        toggleVisibility={toggleAllPasswords}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />

                    <button 
                        type="submit" 
                        className={`btn-submit ${isLoading ? 'btn-disabled' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "PROCESANDO..." : "CREAR CUENTA"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Ya sos socio? <Link to="/login">Iniciá sesión</Link></p>
                </div>

                <BackButton mobileOnly />
            </div>
        </div>
    );
};

export default Register;
