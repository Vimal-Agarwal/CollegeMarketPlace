// ============================================================
//  Navbar.jsx — Navigation Component
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Experiment 6: Props instead of Redux — user & onLogout passed from App.jsx
function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  // Experiment 6: useState for mobile menu toggle
  const [open, setOpen] = useState(false);

  // Experiment 6: onClick event handler
  const handleLogout = () => {
    onLogout();       // update App state
    navigate('/');    // redirect to home
  };

  return (
    <nav className="navbar">
      {/* Experiment 7: Link component for client-side navigation */}
      <Link to="/" className="navbar-logo">
        <i className="fa-solid fa-graduation-cap"></i> College <span>Market</span> Place
      </Link>

      {/* Experiment 6: onClick toggles state */}
      <button className="nav-toggle" onClick={() => setOpen(!open)}>
        <i className="fa-solid fa-bars"></i>
      </button>

      <div className={`navbar-actions ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        {/* Experiment 7: Multiple Link components for routing */}
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/buy" className="nav-link browse-btn">Browse</Link>

        {/* Conditional rendering based on user state */}
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">My Dashboard</Link>
            <Link to="/sell" className="nav-btn sell">+ Sell Item</Link>
            <button className="nav-link nav-btn auth" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/sell" className="nav-btn sell">+ Sell Item</Link>
            <Link to="/login" className="nav-link nav-btn auth">Login</Link>
            <Link to="/signup" className="nav-btn auth" style={{ padding: '8px 20px', fontSize: '0.75rem' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
