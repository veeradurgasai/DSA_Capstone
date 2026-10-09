import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <path d="M11 8v6"></path>
            <path d="M8 11h6"></path>
          </svg>
          <span>Lost & Found <span style={{ color: 'var(--gold)', fontWeight: '900' }}>Intelligence</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li><NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink></li>
          <li><NavLink to="/lost" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Lost Directory</NavLink></li>
          <li><NavLink to="/found" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Found Directory</NavLink></li>
          <li><NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Search</NavLink></li>
          <li><NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Campus Map</NavLink></li>
          {user && <li><NavLink to="/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Claims</NavLink></li>}
          {user && !isAdmin && <li><NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>}
          {isAdmin && <li><NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Admin Portal</NavLink></li>}
        </ul>

        {/* Action Controls & Mobile Toggle */}
        <div className="nav-actions">
          {user ? (
            <div className="nav-user-cluster">
              <Link to="/profile" className="user-pill-chip" title="View Profile & Account Settings">
                <span className="user-avatar-initial">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="user-pill-meta">
                  <span className="user-pill-name">{user.name}</span>
                  <span className="user-pill-role">{isAdmin ? '🛡️ Admin' : '🎓 Student'}</span>
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-cancel-glass nav-logout-btn" title="Sign Out">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-guest-cluster">
              <Link to="/login" className="btn btn-ice-glass btn-sm">Login</Link>
              <Link to="/register" className="btn btn-neon-glow btn-sm">Register</Link>
            </div>
          )}

          {/* Hamburger button for mobile */}
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {user && (
            <Link to="/profile" onClick={closeMenu} className="mobile-user-card" title="View Profile & Settings">
              <span className="user-avatar-initial">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--light-gold)', fontWeight: 600 }}>
                  {isAdmin ? '🛡️ Campus Administrator' : '🎓 Enrolled Student'}
                </div>
              </div>
            </Link>
          )}

          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/lost" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Lost Directory</NavLink>
          <NavLink to="/found" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Found Directory</NavLink>
          <NavLink to="/search" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Search</NavLink>
          <NavLink to="/map" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Campus Map</NavLink>
          {user && <NavLink to="/claims" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Claims</NavLink>}
          {user && !isAdmin && <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Student Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Admin Portal</NavLink>}
          {user && <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>👤 My Profile & Settings</NavLink>}
          
          {user ? (
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', marginTop: '0.25rem' }}>
              <button onClick={handleLogout} className="btn btn-cancel-glass btn-sm" style={{ width: '100%' }}>
                Logout ({user.name})
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', marginTop: '0.25rem' }}>
              <Link to="/login" onClick={closeMenu} className="btn btn-ice-glass btn-sm" style={{ flex: 1, textAlign: 'center' }}>Login</Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-neon-glow btn-sm" style={{ flex: 1, textAlign: 'center' }}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
