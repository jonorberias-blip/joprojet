import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { to: '/utilisateurs', label: 'Bibliothécaires', icon: '👤' },
    { to: '/parametres', label: 'Paramètres du site', icon: '⚙️' },
  ];

  const biblioLinks = [
    { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { to: '/livres',    label: 'Livres',           icon: '📚' },
    { to: '/membres',   label: 'Membres',          icon: '👥' },
    { to: '/emprunts',  label: 'Emprunts',         icon: '📋' },
    { to: '/retards',   label: 'Retards',          icon: '⚠️' },
    { to: '/reservations', label: 'Réservations',  icon: '🔖' },
  ];

  const links = user?.role === 'admin' ? [...adminLinks, ...biblioLinks.slice(1)] : biblioLinks;

  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        📖 Biblio<span>thèque</span>
      </Link>
      <div className="sidebar-role">{user?.role === 'admin' ? 'Administrateur' : 'Bibliothécaire'}</div>
      <nav>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
          {user?.prenom} {user?.nom}
        </div>
        <button className="btn-logout" onClick={logout}>🚪 Se déconnecter</button>
      </div>
    </div>
  );
}
