// src/components/AuthInput.jsx
import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AuthInput = ({ label, type = "text", placeholder, required = true, isPasswordVisible, toggleVisibility, ...props }) => {
    // Detectamos si es un campo de contraseña
    const isPasswordField = props.autoComplete === 'new-password' || type === 'password';

    // El tipo real depende de la prop que viene del padre
    const renderType = isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type;

    return (
        <div className="input-group">
            <label>{label}</label>
            <div className="input-wrapper" style={{ position: 'relative', width: '100%' }}>
                <input 
                    type={renderType}
                    placeholder={placeholder} 
                    required={required} 
                    {...props} 
                    style={isPasswordField ? { paddingRight: '45px' } : {}}
                />
                
                {isPasswordField && (
                    <div className="input-icon-action" 
                        onClick={toggleVisibility} 
                        style={{
                            position: 'absolute',
                            right: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            display: 'flex',
                            zIndex: 5,
                            fontSize: '1.2rem',
                            color: '#aaaaaa'
                    }}>
                        {isPasswordVisible ? <FiEyeOff /> : <FiEye />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthInput;