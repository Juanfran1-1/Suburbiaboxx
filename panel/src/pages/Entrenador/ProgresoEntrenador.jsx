import ProgresoGestion from '../shared/ProgresoGestion';
import NavbarEntrenador from '../../components/Dashboard/NavbarEntrenador';

export default function ProgresoEntrenador() {
    return (
        <ProgresoGestion
            navbar={<NavbarEntrenador />}
            role="entrenador"
            title="PROGRESO"
            scopeLabel="ENTRENADOR"
        />
    );
}
