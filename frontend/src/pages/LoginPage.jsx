// ============================================================
//  LoginPage.jsx — Login Page
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

// Experiment 6: Props — onLogin and user passed from App.jsx
function LoginPage({ onLogin, user }) {
  const navigate = useNavigate();

  // Experiment 6: useState for controlled form inputs
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, go to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  // Experiment 6: onChange updates the form state
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Experiment 6: onClick / form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill all fields!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Experiment 9: POST /api/auth/login using fetch
      const data = await login(form);
      onLogin(data.data);          // update App state
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f5a623', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
            Login
          </h2>
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        {/* Show error message if login fails */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            {/* Experiment 6: Controlled input with value + onChange */}
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@college.ac.in"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {/* Experiment 6: onClick on button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</>
              : <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
