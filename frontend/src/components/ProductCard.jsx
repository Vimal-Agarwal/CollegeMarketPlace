import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleWishlist } from '../utils/api';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

const openWhatsapp = (phone, name, price) => {
  const waPhone = phone || '910000000000';
  const msg = encodeURIComponent(
    `Hi! I'm interested in "${name}" for ${formatPrice(price)} on CollegeMarketPlace.`
  );
  window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
};

function ProductCard({ product, wishlisted = false, onWishlistToggle }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(wishlisted);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setLiked(wishlisted);
  }, [wishlisted]);

  const sellerName = product.seller?.name || 'Unknown Seller';
  const phone = product.seller?.phone || '';
  const isSold = product.isSold;

  const handleLike = async (e) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('cm_user'));
    if (!user) { navigate('/login'); return; }
    if (liking) return;

    const nextLiked = !liked;
    setLiking(true);
    setLiked(nextLiked);

    try {
      await toggleWishlist(product._id);
      if (onWishlistToggle) {
        onWishlistToggle(nextLiked);
      }
    } catch (err) {
      setLiked(!nextLiked);
    } finally {
      setLiking(false);
    }
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product._id}`)}
      style={{ opacity: isSold ? 0.75 : 1, position: 'relative' }}
    >
      <div className="card-img-wrap">

        {/* SOLD overlay banner */}
        {isSold ? (
          <span style={{
            position: 'absolute', top: 10, left: 0,
            background: '#dc2626', color: 'white',
            fontWeight: 900, fontSize: '0.72rem',
            padding: '4px 12px', letterSpacing: 1,
            borderRadius: '0 6px 6px 0', zIndex: 5,
          }}>SOLD</span>
        ) : (
          <span className="featured-badge">Featured</span>
        )}

        <img
          src={product.image || 'https://placehold.co/300x200?text=No+Image'}
          alt={product.name}
          style={{ filter: isSold ? 'grayscale(40%)' : 'none' }}
          onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=No+Image'; }}
        />

        {/* Heart button — disabled if sold */}
        {!isSold && (
          <button className="heart-btn" onClick={handleLike}
            title={liked ? 'Remove from wishlist' : 'Add to wishlist'}>
            <i className={liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
              style={{ color: liked ? '#e53935' : undefined }}></i>
          </button>
        )}

        {/* WhatsApp button */}
        <button className="whatsapp-btn"
          onClick={(e) => { e.stopPropagation(); openWhatsapp(phone, product.name, product.price); }}>
          <i className="fa-brands fa-whatsapp"></i>
        </button>
      </div>

      <div className="card-body">
        <div className="card-price" style={{ color: isSold ? '#9ca3af' : undefined }}>
          {formatPrice(product.price)}
        </div>
        <div className="card-title">{product.name}</div>
        <div className="card-seller">{sellerName}</div>

        {/* Button — disabled + different text if sold */}
        <button
          className="card-action-btn"
          style={{
            background: isSold ? '#f3f4f6' : undefined,
            color: isSold ? '#9ca3af' : undefined,
            cursor: isSold ? 'not-allowed' : 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
          disabled={false}
        >
          {isSold ? '🔴 Sold Out' : 'View Details'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
