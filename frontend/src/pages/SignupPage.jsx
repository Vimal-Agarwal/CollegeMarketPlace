// ============================================================
//  SignupPage.jsx — Signup Page
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../utils/api';

const COLLEGES = ['SKIT', 'VGU', 'JECRC', 'MNIT', 'JNU'];

function SignupPage({ onLogin, user }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', collegeId: '', college: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.collegeId || !form.college) {
      setError('Please fill all fields!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await signup(form);
      onLogin(data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f5a623', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
            Signup
          </h2>
        </div>

        <h2>Create Account</h2>
        <p className="subtitle">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" className="form-input"
              placeholder="Your full name"
              value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>College Email</label>
            <input type="email" name="email" className="form-input"
              placeholder="you@college.ac.in"
              value={form.email} onChange={handleChange} required />
          </div>

          {/* Simple College Dropdown */}
          <div className="form-group">
            <label>College Name</label>
            <select name="college" className="form-input"
              value={form.college} onChange={handleChange} required>
              <option value="" disabled>Select your college</option>
              {COLLEGES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>College ID / Roll No.</label>
            <input type="text" name="collegeId" className="form-input"
              placeholder="e.g. 22CS101"
              value={form.collegeId} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-input"
              placeholder="Create a password"
              value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating...</>
              : <><i className="fa-solid fa-user-plus"></i> Create Account</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
