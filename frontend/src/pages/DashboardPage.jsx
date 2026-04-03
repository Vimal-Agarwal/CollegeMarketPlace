// ============================================================
//  DashboardPage.jsx
//  Tabs: My Listings | Incoming Orders (Seller) | My Orders (Buyer) | Wishlist
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMyListings, deleteProduct,
  getMyOrders, getIncomingOrders, updateOrderStatus,
  getMyWishlist
} from '../utils/api';
import ProductCard from '../components/ProductCard';

const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');

function DashboardPage({ user }) {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [tab, setTab] = useState('listings');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [lRes, oRes, iRes, wRes] = await Promise.all([
          getMyListings(),
          getMyOrders(),
          getIncomingOrders(),
          getMyWishlist(),
        ]);

        // Deduplicate to avoid any accidental duplicates
        const unique = (items) => Array.from(new Map((items || []).map(p => [p._id, p])).values());

        setListings(unique(lRes.data));
        setMyOrders(unique(oRes.data));
        setIncomingOrders(unique(iRes.data));
        setWishlist(unique(wRes.data));
      } catch (err) {
        console.error('Dashboard error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Delete my listing — seller kisi bhi time delete kar sakta hai (sold ya unsold)
  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap yeh listing permanently delete karna chahte ho?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setListings(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Seller: Mark as Sold (Confirm order) or Cancel
  const handleOrderStatus = async (orderId, status) => {
    const msg = status === 'Confirmed'
      ? 'Mark this order as SOLD? Product will be hidden from Browse.'
      : 'Cancel this order?';
    if (!window.confirm(msg)) return;

    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, status);
      // Update local state
      setIncomingOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status } : o)
      );
      // If confirmed — also mark that listing as sold locally
      if (status === 'Confirmed') {
        const order = incomingOrders.find(o => o._id === orderId);
        if (order) {
          setListings(prev =>
            prev.map(p => p._id === order.product ? { ...p, isSold: true } : p)
          );
        }
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
      <p>Loading your dashboard...</p>
    </div>
  );

  const pendingIncoming = incomingOrders.filter(o => o.status === 'Pending').length;

  const tabStyle = (t) => ({
    padding: '10px 16px', cursor: 'pointer', fontWeight: 700,
    fontSize: '0.82rem', border: 'none', background: 'none',
    borderBottom: tab === t ? '3px solid var(--primary)' : '3px solid transparent',
    color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
    position: 'relative', whiteSpace: 'nowrap',
  });

  // Status badge style helper
  const statusBadge = (status) => {
    const map = {
      Pending: { bg: '#fff7ed', color: '#ea580c' },
      Confirmed: { bg: '#f0fdf4', color: '#16a34a' },
      Cancelled: { bg: '#fef2f2', color: '#dc2626' },
      Completed: { bg: '#eff6ff', color: '#2563eb' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
    return {
      fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
      borderRadius: '20px', background: s.bg, color: s.color,
    };
  };

  return (
    <div style={{ padding: '2rem 8%', minHeight: '80vh' }}>

      {/* Header */}
      <div className="dash-header">
        <div>
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {user?.email} &bull; College ID: {user?.collegeId}
          </p>
        </div>
        <Link to="/sell" className="btn btn-accent">
          <i className="fa-solid fa-plus"></i> Post New Ad
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'My Listings', value: listings.length, icon: 'fa-tag', color: 'var(--primary)' },
          { label: 'Incoming Orders', value: incomingOrders.length, icon: 'fa-bell', color: '#7c3aed' },
          { label: 'My Orders', value: myOrders.length, icon: 'fa-bag-shopping', color: '#ea580c' },
          { label: 'Wishlist', value: wishlist.length, icon: 'fa-heart', color: '#e53935' },
          { label: 'Sold', value: listings.filter(p => p.isSold).length, icon: 'fa-handshake', color: '#16a34a' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-alt)', borderRadius: 'var(--radius)', padding: '1.1rem', textAlign: 'center' }}>
            <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '1.4rem', marginBottom: '0.4rem' }}></i>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{s.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
        <button style={tabStyle('listings')} onClick={() => setTab('listings')}>
          <i className="fa-solid fa-tag"></i> My Listings ({listings.length})
        </button>

        {/* Incoming Orders tab — shows red dot if pending orders exist */}
        <button style={tabStyle('incoming')} onClick={() => setTab('incoming')}>
          <i className="fa-solid fa-bell"></i> Incoming Orders ({incomingOrders.length})
          {pendingIncoming > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: 2,
              background: '#e53935', color: 'white',
              borderRadius: '50%', width: 16, height: 16,
              fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
            }}>{pendingIncoming}</span>
          )}
        </button>

        <button style={tabStyle('orders')} onClick={() => setTab('orders')}>
          <i className="fa-solid fa-bag-shopping"></i> My Orders ({myOrders.length})
        </button>

        <button style={tabStyle('wishlist')} onClick={() => setTab('wishlist')}>
          <i className="fa-solid fa-heart"></i> Wishlist ({wishlist.length})
        </button>
      </div>

      {/* ── TAB 1: MY LISTINGS ── */}
      {tab === 'listings' && (
        listings.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-store"></i>
            <p>No listings yet.</p>
            <Link to="/sell" className="btn btn-accent" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Post Your First Ad
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {listings.map(p => (
              <div key={p._id} style={{
                display: 'flex', gap: '1rem', background: 'var(--bg-alt)',
                borderRadius: 'var(--radius)', padding: '0.75rem', alignItems: 'center',
                opacity: p.isSold ? 0.6 : 1,
              }}>
                <img src={p.image || 'https://placehold.co/80x60?text=Item'} alt={p.name}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://placehold.co/80x60?text=Item'; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatPrice(p.price)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.category} &bull;&nbsp;
                    {p.isSold
                      ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✅ Sold</span>
                      : <span style={{ color: '#16a34a' }}>🟢 Active</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    onClick={() => navigate(`/product/${p._id}`)}>
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  {/* ✅ NEW: Seller kisi bhi time product delete kar sakta hai — sold ho ya na ho */}
                  <button className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '6px 12px', color: '#dc2626', borderColor: '#dc2626' }}
                    onClick={() => handleDelete(p._id)} disabled={deleting === p._id}
                    title={p.isSold ? 'Sold listing delete karo' : 'Listing delete karo'}>
                    {deleting === p._id
                      ? <i className="fa-solid fa-spinner fa-spin"></i>
                      : <i className="fa-solid fa-trash"></i>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── TAB 2: INCOMING ORDERS (Seller View) ── */}
      {tab === 'incoming' && (
        incomingOrders.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-bell"></i>
            <p>No one has ordered your products yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>When a buyer places an order, it will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {incomingOrders.map(o => (
              <div key={o._id} style={{
                background: o.status === 'Pending' ? '#fffbeb' : 'var(--bg-alt)',
                border: o.status === 'Pending' ? '1.5px solid #fcd34d' : '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1rem',
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img src={o.productImage || 'https://placehold.co/70x55?text=Item'} alt={o.productName}
                    style={{ width: 70, height: 55, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    onError={e => { e.target.src = 'https://placehold.co/70x55?text=Item'; }} />

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.productName}</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatPrice(o.productPrice)}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <i className="fa-solid fa-user" style={{ marginRight: 4 }}></i>
                      Buyer: <strong>{o.buyerName}</strong> ({o.buyerEmail})
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Ordered on: {formatDate(o.createdAt)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={statusBadge(o.status)}>{o.status}</span>

                    {/* Only show action buttons if Pending */}
                    {o.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* ✅ Mark as Sold */}
                        <button
                          onClick={() => handleOrderStatus(o._id, 'Confirmed')}
                          disabled={updatingOrder === o._id}
                          style={{
                            padding: '7px 14px', borderRadius: 8, border: 'none',
                            background: '#16a34a', color: 'white',
                            fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                          {updatingOrder === o._id
                            ? <i className="fa-solid fa-spinner fa-spin"></i>
                            : <><i className="fa-solid fa-check"></i> Mark as Sold</>}
                        </button>

                        {/* ❌ Cancel */}
                        <button
                          onClick={() => handleOrderStatus(o._id, 'Cancelled')}
                          disabled={updatingOrder === o._id}
                          style={{
                            padding: '7px 14px', borderRadius: 8,
                            border: '1.5px solid #dc2626', background: 'white',
                            color: '#dc2626', fontWeight: 700,
                            fontSize: '0.78rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── TAB 3: MY ORDERS (Buyer View) ── */}
      {tab === 'orders' && (
        myOrders.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-bag-shopping"></i>
            <p>No orders placed yet.</p>
            <Link to="/buy" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myOrders.map(o => (
              <div key={o._id} style={{
                display: 'flex', gap: '1rem', background: 'var(--bg-alt)',
                borderRadius: 'var(--radius)', padding: '0.75rem', alignItems: 'center', flexWrap: 'wrap',
              }}>
                <img src={o.productImage || 'https://placehold.co/80x60?text=Item'} alt={o.productName}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://placehold.co/80x60?text=Item'; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.productName}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatPrice(o.productPrice)}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Seller: {o.sellerName}
                    {o.sellerPhone && <> &bull; 📞 {o.sellerPhone}</>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={statusBadge(o.status)}>{o.status}</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {formatDate(o.createdAt)}
                  </div>
                  {o.status === 'Confirmed' && (
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: 4, fontWeight: 700 }}>
                      ✅ Seller confirmed! Meet on campus.
                    </div>
                  )}
                  {o.status === 'Cancelled' && (
                    <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: 4, fontWeight: 700 }}>
                      ❌ Order was cancelled.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── TAB 4: WISHLIST ── */}
      {tab === 'wishlist' && (
        wishlist.length === 0 ? (
          <div className="empty-state">
            <i className="fa-regular fa-heart"></i>
            <p>No items in wishlist yet. Hit ❤️ on any product!</p>
            <Link to="/buy" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                wishlisted={true}
                onWishlistToggle={(isLiked) => {
                  if (!isLiked) {
                    setWishlist(prev => prev.filter(item => item._id !== p._id));
                  }
                }}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
}

export default DashboardPage;
