import DashboardNavbar from './DashboardNavBar';
import '../../styles/NavBar.css';

export default function NavbarAlumno() {
    const links = [
        { to: '/alumno/inicio', label: 'INICIO' },
        { to: '/alumno/clases', label: 'MIS CLASES' },
        { to: '/alumno/pagos', label: 'MIS PAGOS' },
        { to: '/alumno/progreso', label: 'MI PROGRESO' },
        { to: '/alumno/perfil', label: 'MI PERFIL' },
    ];

    return <DashboardNavbar links={links} />;
}
