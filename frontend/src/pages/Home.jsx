// ============================================================
//  Home.jsx — Home Page
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Textbooks', icon: 'fa-book', color: '#6c63ff' },
  { name: 'Electronics', icon: 'fa-laptop', color: '#f5a623' },
  { name: 'Cycles', icon: 'fa-bicycle', color: '#23c985' },
  { name: 'Furniture', icon: 'fa-couch', color: '#e53935' },
  { name: 'Stationery', icon: 'fa-pen-ruler', color: '#ab47bc' },
  { name: 'Clothing', icon: 'fa-shirt', color: '#e91e8c' },
  { name: 'Sports', icon: 'fa-basketball', color: '#00bcd4' },
  { name: 'Instruments', icon: 'fa-guitar', color: '#ff7043' },
];

function Home() {
  const navigate = useNavigate();

  // Experiment 6: useState for search input and products list
  const [heroSearch, setHeroSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Experiment 9: fetch products from Express backend on page load
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();       // GET /api/products
        setProducts(data.data || []);
      } catch (err) {
        console.error('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Experiment 6: onChange handler updates state
  const handleSearchChange = (e) => setHeroSearch(e.target.value);

  // Experiment 6: onClick handler triggers navigation
  const handleSearch = () => {
    if (heroSearch.trim()) navigate(`/buy?q=${heroSearch}`);
    else navigate('/buy');
  };

  return (
    <>
      {/* ===== Hero Banner ===== */}
      <section className="hero-banner" id="hero-banner">
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-orb orb-3"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Campus <span className="highlight">Buy & Sell</span> Platform
          </h1>
          <p className="hero-subtitle">Buy cheap. Sell fast. Right here on campus.</p>

          {/* Experiment 6: Controlled input with onChange */}
          <div className="hero-search-wrap">
            <input
              type="text"
              value={heroSearch}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for textbooks, laptops, cycles..."
            />
            <button className="hero-search-btn" onClick={handleSearch}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          <button className="hero-cta" onClick={() => navigate('/buy')}>
            <i className="fa-solid fa-store"></i> Browse Products
          </button>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">{products.length}</span>
              <span className="hero-stat-label">Products</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">8</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Campus Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Category Grid ===== */}
      <section className="category-section">
        <div className="category-section-header">
          <h2>Browse Categories</h2>
          <span onClick={() => navigate('/buy')} style={{ cursor: 'pointer' }}>View All →</span>
        </div>
        <div className="category-grid">
          {/* Experiment 6: onClick on each category card */}
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="category-card"
              onClick={() => navigate(`/buy?cat=${cat.name}`)}
            >
              <div className="category-icon-wrap" style={{ background: cat.color }}>
                <i className={`fa-solid ${cat.icon}`}></i>
              </div>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Featured Products ===== */}
      <main style={{ padding: '2rem 8%' }}>
        <h2 className="section-title">Fresh Recommendations</h2>

        {loading ? (
          <div className="empty-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-box-open"></i>
            <p>No products yet. Be the first to sell!</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {/* How It Works */}
        <section style={{ marginTop: '4rem', marginBottom: '2rem' }}>
          <h2 className="section-title">How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {[
              { icon: 'fa-user-plus', color: 'var(--blue)', step: '1. Sign Up', desc: 'Create an account with your College ID' },
              { icon: 'fa-magnifying-glass', color: 'var(--blue)', step: '2. Browse', desc: 'Find items listed by seniors & classmates' },
              { icon: 'fa-brands fa-whatsapp', color: '#25d366', step: '3. Contact Seller', desc: 'Chat via WhatsApp before buying' },
              { icon: 'fa-handshake', color: 'var(--accent)', step: '4. Meet & Pay', desc: 'Meet on campus and pay Cash on Delivery' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-lg)' }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '2rem', marginBottom: '1rem', color: item.color }}></i>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{item.step}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
