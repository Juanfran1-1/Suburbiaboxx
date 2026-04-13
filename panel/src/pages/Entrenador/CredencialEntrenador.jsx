import NavbarEntrenador from '../../components/Dashboard/NavbarEntrenador';
import UserCredential from '../../components/Dashboard/UserCredential.jsx';
import '../../styles/Dashboard.css';

export default function CredencialEntrenador() {
    return (
        <div className="dashboard-wrapper">
            <NavbarEntrenador />
            <div className="content-container">
                <UserCredential />
            </div>
        </div>
    );
}