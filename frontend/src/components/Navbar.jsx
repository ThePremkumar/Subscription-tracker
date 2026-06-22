import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand">
          <span className="navbar-logo-icon">
            <Zap size={18} color="#fff" />
          </span>
          <span className="navbar-brand-name">SubTrack</span>
        </NavLink>

        {/* Nav links */}
        {isAuthenticated && (
          <ul className="navbar-nav">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  'navbar-link' + (isActive ? ' active' : '')
                }
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/subscriptions"
                className={({ isActive }) =>
                  'navbar-link' + (isActive ? ' active' : '')
                }
              >
                <CreditCard size={16} />
                Subscriptions
              </NavLink>
            </li>
          </ul>
        )}

        {/* Actions */}
        {isAuthenticated && (
          <div className="navbar-actions">
            <span className="user-avatar" title={user?.name}>
              {initials}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              id="navbar-logout-btn"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
