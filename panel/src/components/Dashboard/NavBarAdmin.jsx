import DashboardNavbar from './DashboardNavBar';
import '../../styles/NavBar.css';

export default function NavbarAdmin() {
    const links = [
        { to: '/admin/inicio', label: 'USUARIOS' },
        { to: '/admin/clases', label: 'CLASES' },
        { to: '/admin/pagos', label: 'PAGOS' },
        { to: '/admin/progreso', label: 'PROGRESO' },
    ];

    return <DashboardNavbar links={links} />;
}
