// ============================================================
//  ProductDetail.jsx
// ============================================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, placeOrder, toggleWishlist, checkWishlist, getMyOrders } from '../utils/api';

const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('cm_user'));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data.data);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadWishlistStatus = async () => {
      if (!user || !id) return;
      try {
        const res = await checkWishlist(id);
        setLiked(res.data?.liked || false);
      } catch (err) {
        // ignore
      }
    };
    loadWishlistStatus();
  }, [id, user]);

  useEffect(() => {
    const loadOrderStatus = async () => {
      if (!user || !id) return;
      try {
        const res = await getMyOrders();
        const hasOrder = (res.data || []).some(o => {
          const productId = o.product?._id || o.product;
          return productId && productId.toString() === id.toString();
        });
        setOrdered(hasOrder);
      } catch (err) {
        // ignore
      }
    };
    loadOrderStatus();
  }, [id, user]);

  const openWhatsapp = () => {
    const phone = product?.seller?.phone || '910000000000';
    const msg = encodeURIComponent(
      `Hi! I'm interested in "${product.name}" for ${formatPrice(product.price)} on CollegeMarketPlace.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Place Order — saves in MongoDB
  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!window.confirm(`Place a COD order for "${product.name}"?`)) return;

    setOrdering(true);
    try {
      // Experiment 9+10: POST /api/orders → saved in MongoDB
      await placeOrder(product._id);
      setOrdered(true);
      setOrderMsg('✅ Order placed! Check your Dashboard → My Orders. Meet seller on campus to pay.');
    } catch (err) {
      setOrderMsg('❌ ' + (err.message || 'Order failed. Try again.'));
    } finally {
      setOrdering(false);
    }
  };

  // Like / Unlike — saves in MongoDB
  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      // Experiment 9+10: POST /api/wishlist/:id → saved in MongoDB
      await toggleWishlist(product._id);
    } catch (err) {
      setLiked(!newLiked); // revert on error
    }
  };

  if (loading) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
      <p>Loading product...</p>
    </div>
  );

  if (!product) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <i className="fa-solid fa-circle-exclamation"></i>
      <p>Product not found.</p>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/buy')}>
        Back to Browse
      </button>
    </div>
  );

  return (
    <main style={{ padding: '2rem 8%', minHeight: '80vh' }}>
      <button className="btn btn-outline" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}
        onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '2.5rem', alignItems: 'start' }}>

        {/* Product Image */}
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--border)' }}>
          <img
            src={product.image || 'https://placehold.co/500x380?text=No+Image'}
            alt={product.name}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.src = 'https://placehold.co/500x380?text=No+Image'; }}
          />
        </div>

        {/* Product Info */}
        <div>
          <span style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px' }}>
            {product.category}
          </span>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1rem' }}>
            {formatPrice(product.price)}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {product.description}
          </p>

          {/* Seller Info */}
          <div style={{ background: 'var(--bg-alt)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
              <i className="fa-solid fa-user-circle"></i> {product.seller?.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {product.seller?.email}
            </div>
          </div>

          {/* Order message */}
          {orderMsg && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
              background: ordered ? '#f0fdf4' : '#fee2e2',
              color: ordered ? '#15803d' : '#dc2626',
              border: `1px solid ${ordered ? '#bbf7d0' : '#fecaca'}`,
            }}>
              {orderMsg}
            </div>
          )}

          {/* Action Buttons */}
          {/* ✅ NEW: Agar logged-in user hi seller hai toh buy buttons mat dikhao */}
          {user && product.sellerRef && user._id === product.sellerRef ? (
            // Seller viewing own product — show informative message only
            <div style={{
              background: '#fffbeb', color: '#92400e',
              padding: '1rem', borderRadius: 'var(--radius)',
              textAlign: 'center', fontWeight: 700,
              border: '1px solid #fde68a',
            }}>
              <i className="fa-solid fa-store"></i> This is your own listing
              <div style={{ fontWeight: 400, fontSize: '0.8rem', marginTop: '4px', color: '#78350f' }}>
                You cannot buy your own item. Manage it via your seller dashboard.
              </div>
            </div>
          ) : product.isSold ? (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius)', textAlign: 'center', fontWeight: 700 }}>
              <i className="fa-solid fa-ban"></i> This item has been sold
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Place Order button */}
              <button
                className="btn btn-primary"
                style={{ flex: 1, minWidth: 140 }}
                onClick={handleOrder}
                disabled={ordering || ordered}
              >
                {ordering
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Placing...</>
                  : ordered
                    ? <><i className="fa-solid fa-check"></i> Order Placed!</>
                    : <><i className="fa-solid fa-bag-shopping"></i> Place COD Order</>
                }
              </button>

              {/* WhatsApp button */}
              <button
                className="btn"
                style={{ flex: 1, minWidth: 140, background: '#25d366', color: 'white', border: 'none' }}
                onClick={openWhatsapp}
              >
                <i className="fa-brands fa-whatsapp"></i> WhatsApp Seller
              </button>
            </div>
          )}

          {/* Like / Wishlist button */}
          <button
            onClick={handleLike}
            style={{
              marginTop: '1rem', width: '100%', padding: '10px',
              border: `2px solid ${liked ? '#e53935' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', background: liked ? '#fff5f5' : 'white',
              color: liked ? '#e53935' : 'var(--text-muted)',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <i className={liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            {liked ? 'Saved to Wishlist ✓' : 'Add to Wishlist'}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            💡 Cash on Delivery — Pay when you meet the seller on campus
          </p>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
