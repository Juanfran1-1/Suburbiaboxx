import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logoSuburbia from '../../assets/logo-suburbia.jpg';
import '../../styles/NavBar.css';

export default function DashboardNavbar({ links }) {
    const [isOpen, setIsOpen] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (cerrando) return;

        setCerrando(true);

        try {
            await supabase.auth.signOut();
            setIsOpen(false);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setCerrando(false);
        }
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            <div className={`menu-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span></span><span></span><span></span>
            </div>

            <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={toggleMenu}></div>

            <nav className={`side-menu ${isOpen ? 'open' : ''}`}>
                <div className="menu-header">
                    <img src={logoSuburbia} alt="Logo Suburbia" />
                    <h3>SUBURBIA BOXX</h3>
                </div>

                <ul className="menu-links">
                    {links.map((link) => (
                        <li key={`${link.to}-${link.label}`}>
                            <NavLink to={link.to} onClick={toggleMenu}>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}

                    <hr className="menu-hr" />

                    <li>
                        <button
                            onClick={handleLogout}
                            className="logout-btn-side"
                            disabled={cerrando}
                        >
                            {cerrando ? 'CERRANDO...' : 'CERRAR SESIÓN'}
                        </button>
                    </li>
                </ul>
            </nav>

            <nav className="nav-main pc-only">
                <div className="nav-left">
                    <img src={logoSuburbia} alt="SUB" className="nav-logo-circle" />
                </div>

                <div className="nav-center">
                    {links.map((link) => (
                        <NavLink key={`${link.to}-${link.label}`} to={link.to}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="nav-right">
                    <button
                        onClick={handleLogout}
                        className="btn-logout-outline"
                        disabled={cerrando}
                    >
                        {cerrando ? 'CERRANDO...' : 'CERRAR SESIÓN'}
                    </button>
                </div>
            </nav>
        </>
    );
}
