import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <>
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

      {/* Bottom Nav for Mobile/Tablet */}
      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0f1120]/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-around items-center shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive ? 'text-violet-400 scale-105' : 'text-gray-400'
              }`
            }
          >
            <LayoutDashboard size={20} className="transition-transform duration-300" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/subscriptions"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive ? 'text-violet-400 scale-105' : 'text-gray-400'
              }`
            }
          >
            <CreditCard size={20} className="transition-transform duration-300" />
            <span>Subscriptions</span>
          </NavLink>
        </div>
      )}
    </>
  );
}
