// ============================================================
//  App.jsx — Root Component
// ============================================================

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import BrowsePage from './pages/BrowsePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SellPage from './pages/SellPage';
import DashboardPage from './pages/DashboardPage';
import ProductDetail from './pages/ProductDetail';
// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Global CSS
import './index.css';


function App() {
  // Store logged-in user in state (simple, no Redux needed)
  const [user, setUser] = useState(() => {
    // Load from localStorage on first render
    const saved = localStorage.getItem('cm_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Called from LoginPage / SignupPage after successful login
  const handleLogin = (userData) => {
    localStorage.setItem('cm_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Called from Navbar logout button
  const handleLogout = () => {
    localStorage.removeItem('cm_user');
    setUser(null);
  };

  // Simple protected route — redirect to /login if not logged in
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="app-wrapper">
        {/* Navbar receives user + logout handler as props */}
        <Navbar user={user} onLogout={handleLogout} />

        <main className="main-content">
          <Routes>
            {/* Experiment 7: Multiple routes with Link-based navigation */}
            <Route path="/" element={<Home />} />
            <Route path="/buy" element={<BrowsePage />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Auth pages — pass handleLogin so they can update state */}
            <Route path="/login" element={<LoginPage onLogin={handleLogin} user={user} />} />
            <Route path="/signup" element={<SignupPage onLogin={handleLogin} user={user} />} />

            {/* Protected routes */}
            <Route path="/sell" element={<ProtectedRoute><SellPage user={user} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage user={user} /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
