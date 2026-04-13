// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useReducer, useRef } from 'react';

// --- IMPORTACIONES DESDE LOS BARRILES ---
import { Login, Register, ForgotPassword, UpdatePassword } from './pages/Auth';
import { InicioAlumno , ClasesAlumno , PagosAlumno, ProgresoAlumno, PerfilAlumno} from './pages/Alumno';
import { InicioEntrenador , ClasesEntrenador, ProgresoEntrenador, PerfilEntrenador } from './pages/Entrenador';
import { InicioAdmin, ClasesAdmin, PagosAdmin, ProgresoAdmin } from './pages/Admin';

import Loader from './components/Loader';
import './styles/global.css';
import { Toaster } from 'react-hot-toast'; 
import ProtectedRoute from './components/ProtectedRoute';

const initialNavigationState = {
  loading: true,
  fadeOut: false,
  shouldRenderContent: false,
};

function navigationReducer(state, action) {
  switch (action.type) {
    case 'start':
      return initialNavigationState;
    case 'filled':
      return {
        ...state,
        fadeOut: true,
        shouldRenderContent: true,
      };
    case 'hide':
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}

function NavigationWatcher({ children }) {
  const location = useLocation();
  const [{ loading, fadeOut, shouldRenderContent }, dispatch] = useReducer(
    navigationReducer,
    initialNavigationState
  );
  const hideLoaderTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(hideLoaderTimerRef.current);
    dispatch({ type: 'start' });
  }, [location.pathname]);

  const handleLoaderFilled = useCallback(() => {
    clearTimeout(hideLoaderTimerRef.current);
    dispatch({ type: 'filled' });

    hideLoaderTimerRef.current = setTimeout(() => {
      dispatch({ type: 'hide' });
    }, 600);
  }, []);

  return (
    <>
      {loading && (
        <div id="loader-wrapper" className={fadeOut ? "loader-fade-out" : ""}>
          <Loader key={location.pathname} onFilled={handleLoaderFilled} />
        </div>
      )}
      <div className={shouldRenderContent ? "page-transition" : "content-hidden"}>
        {shouldRenderContent && children}
      </div>
    </>
  );
}

function App() {
  const routerBasename = import.meta.env.VITE_ROUTER_BASENAME || '/';

  return (
    <Router basename={routerBasename}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{ zIndex: 20000 }}
      /> 
      <NavigationWatcher> 
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* RUTAS ALUMNO */}
          <Route element={<ProtectedRoute allowedRoles={['alumno']} />}>
              <Route path="/alumno/inicio" element={<InicioAlumno />} />
              <Route path="/alumno/clases" element={<ClasesAlumno />} />
              <Route path="/alumno/pagos" element={<PagosAlumno />} />
              <Route path="/alumno/progreso" element={<ProgresoAlumno />} />
              <Route path="/alumno/perfil" element={<PerfilAlumno />} />
          </Route>

          {/* RUTAS ENTRENADOR */}
          <Route element={<ProtectedRoute allowedRoles={['entrenador']} />}>
              <Route path="/entrenador/inicio" element={<InicioEntrenador />} />
              <Route path="/entrenador/clases" element={<ClasesEntrenador />} />
              <Route path="/entrenador/progreso" element={<ProgresoEntrenador />} />
              <Route path="/entrenador/perfil" element={<PerfilEntrenador />} />
          </Route>

          {/* RUTAS ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/inicio" element={<InicioAdmin />} />
            <Route path="/admin/clases" element={<ClasesAdmin />} />
            <Route path="/admin/pagos" element={<PagosAdmin />} />
            <Route path="/admin/progreso" element={<ProgresoAdmin />} />
        </Route>

          {/* REDIRECCIONES */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </NavigationWatcher>
    </Router>
  );
}

export default App;
