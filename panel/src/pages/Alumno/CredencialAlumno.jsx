import NavbarAlumno from '../../components/Dashboard/NavbarAlumno';
import UserCredential from '../../components/Dashboard/UserCredential.jsx';
import '../../styles/Dashboard.css';

export default function CredencialAlumno() {
    return (
        <div className="dashboard-wrapper">
            <NavbarAlumno />
            <div className="content-container">
                <UserCredential />
            </div>
        </div>
    );
}