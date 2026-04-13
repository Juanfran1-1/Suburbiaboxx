import DashboardNavbar from './DashboardNavBar';
import '../../styles/NavBar.css';

export default function NavbarEntrenador() {
    const links = [
        { to: '/entrenador/inicio', label: 'INICIO' },
        { to: '/entrenador/clases', label: 'MIS CLASES' },
        { to: '/entrenador/progreso', label: 'PROGRESO' },
        { to: '/entrenador/perfil', label: 'MI PERFIL' },
    ];

    return <DashboardNavbar links={links} />;
}
