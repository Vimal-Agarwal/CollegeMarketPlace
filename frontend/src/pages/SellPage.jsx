// ============================================================
//  SellPage.jsx — Post an Ad
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../utils/api';

const CATEGORIES = ['Textbooks', 'Electronics', 'Cycles', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Instruments', 'Others'];

// Experiment 6: Functional component — user passed as prop from App.jsx
function SellPage({ user }) {
  const navigate = useNavigate();

  // Experiment 6: useState for form fields
  const [form, setForm] = useState({
    name: '', category: '', price: '', description: '',
    phone: user?.phone || '', image: '',
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Experiment 6: onChange handler
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Experiment 6: FileReader API — convert image to base64
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setForm({ ...form, image: evt.target.result });
      setPreview(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Experiment 6 + 9: Form submit — calls POST API
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, price, description, phone, image } = form;
    if (!name || !category || !price || !description || !phone) {
      setError('Please fill all required fields!');
      return;
    }
    if (!image) { setError('Please upload a product image.'); return; }

    setLoading(true);
    setError('');
    try {
      // Experiment 9: POST /api/products — create a product in MongoDB
      await createProduct({ name, category, price: Number(price), description, phone, image });
      alert('Your ad has been posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to post ad. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow" style={{ background: 'var(--bg-alt)', padding: '2.5rem 1rem', minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ maxWidth: 560, width: '100%', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '2.5rem' }}>

        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.25rem' }}>
          <i className="fa-solid fa-camera"></i> Post Your Ad
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Fill in details to list your item on campus
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}

        {/* Experiment 6: Controlled form with onChange on every input */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Title</label>
            <input type="text" name="name" className="form-input"
              placeholder="e.g. HP Laptop 16GB RAM"
              value={form.name} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select name="category" className="form-input"
                value={form.category} onChange={handleChange} required>
                <option value="" disabled>Select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" name="price" className="form-input"
                placeholder="500" min="0"
                value={form.price} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" className="form-input"
                value={user?.name || ''} readOnly
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="tel" name="phone" className="form-input"
                placeholder="91XXXXXXXXXX"
                value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input type="file" className="form-input" accept="image/*"
              onChange={handleImage} required />
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
              Upload a clear photo of your product.
            </p>
          </div>

          {/* Image preview — shown only after image selected */}
          {preview && (
            <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border)' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-input" rows="4"
              placeholder="Describe condition, age, reason for selling..."
              value={form.description} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Posting...</>
              : <><i className="fa-solid fa-paper-plane"></i> Post Ad Now</>
            }
          </button>
        </form>
      </div>
    </main>
  );
}

export default SellPage;
