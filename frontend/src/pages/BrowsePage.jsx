// ============================================================
//  BrowsePage.jsx — Browse All Products
// ============================================================

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Cycles', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Instruments', 'Others'];

const CAT_ICONS = {
  All: 'fa-border-all', Textbooks: 'fa-book', Electronics: 'fa-laptop',
  Cycles: 'fa-bicycle', Clothing: 'fa-shirt', Furniture: 'fa-couch',
  Stationery: 'fa-pen-ruler', Sports: 'fa-basketball',
  Instruments: 'fa-guitar', Others: 'fa-ellipsis',
};

function BrowsePage() {
  // Experiment 7: Read URL query params (e.g. /buy?cat=Electronics)
  const [searchParams, setSearchParams] = useSearchParams();

  // Experiment 6: useState for all filter states
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'All');
  const [sort, setSort] = useState('default');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Experiment 9: Fetch products from Express backend whenever filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        if (sort !== 'default') params.sort = sort;

        // Experiment 9: GET /api/products?search=...&category=...
        const data = await getProducts(params);
        setProducts(data.data || []);
      } catch (err) {
        console.error('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [search, category, sort]);

  // Sync URL params when filters change (Experiment 7)
  useEffect(() => {
    const params = {};
    if (search) params.q = search;
    if (category !== 'All') params.cat = category;
    setSearchParams(params);
  }, [search, category]);

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Search Hero */}
      <section className="hero-search">
        <h1>Browse Campus Products</h1>
        <div className="search-box">
          {/* Experiment 6: onChange handler updates state */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search what you want to buy..."
          />
          <button type="button">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </section>

      {/* Category Pills */}
      <div className="category-bar">
        {/* Experiment 6: onClick updates category state */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            <i className={`fa-solid ${CAT_ICONS[cat]}`}></i> {cat}
          </button>
        ))}
      </div>

      <main style={{ padding: '1.5rem 8%' }}>
        {/* Sort Filter */}
        <div className="filter-bar">
          {/* Experiment 6: onChange on select */}
          <select
            className="form-input"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="default">Sort: Default</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="empty-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-box-open"></i>
            <p>No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BrowsePage;
