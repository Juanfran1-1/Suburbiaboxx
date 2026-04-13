// src/components/SuburbiaToast.js
import { toast } from 'react-hot-toast';

const toastConfig = {
    style: {
        background: '#121212', // Negro profundo
        color: '#fff',
        border: '2px solid #d4ff00', // El verde lima de Suburbia
        borderRadius: '4px',
        padding: '16px',
        fontFamily: 'sans-serif', // O la fuente que uses en el CSS
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '13px',
        letterSpacing: '1px'
    },
    success: {
        iconTheme: {
        primary: '#d4ff00',
        secondary: '#000',
        },
    },
    error: {
        style: {
        border: '2px solid #ff4b4b', // Rojo para errores
        background: '#121212',
        color: '#fff',
        },
        iconTheme: {
        primary: '#ff4b4b',
        secondary: '#000',
        },
    },
};

export const notify = {
    success: (msg) => toast.success(msg, toastConfig),
    error: (msg) => toast.error(msg, { ...toastConfig, ...toastConfig.error }),
    loading: (msg) => toast.loading(msg, toastConfig),
};