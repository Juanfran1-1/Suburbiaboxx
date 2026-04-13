import ProgresoGestion from '../shared/ProgresoGestion';
import NavbarAdmin from '../../components/Dashboard/NavBarAdmin';

export default function ProgresoAdmin() {
    return (
        <ProgresoGestion
            navbar={<NavbarAdmin />}
            role="admin"
            title="PROGRESO"
            scopeLabel="ADMIN"
        />
    );
}
