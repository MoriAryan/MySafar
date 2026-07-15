import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Plus, ChevronLeft, Menu, X, FileText
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resumes', icon: FileText, label: 'Resumes' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ onAddClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src="/logo.png"
              alt="MySafar Logo"
              className="sidebar-logo-img"
            />
            {!collapsed && <span className="sidebar-logo-text">MySafar</span>}
          </div>
          <button
            className="sidebar-close-mobile"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
          <button
            className="sidebar-toggle hide-mobile"
            onClick={() => setCollapsed(c => !c)}
          >
            <ChevronLeft size={16} className={collapsed ? 'rotate-180' : ''} />
          </button>
        </div>

        {/* Quick Add */}
        <div className="sidebar-section">
          <button
            className="sidebar-add-btn"
            onClick={onAddClick}
          >
            <Plus size={18} />
            {!collapsed && <span>Track New</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
              end={item.to === '/'}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={() => {
              localStorage.removeItem('mysafar_token');
              window.location.href = '/login';
            }}
            title={collapsed ? 'Logout' : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
