// ============================================================
//  Footer.jsx — Footer Component
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-col footer-col">
          <div className="footer-logo" ><i className="fa-solid fa-graduation-cap"></i> COLLEGE <span> MARKET</span> PLACE</div>
          <p>The easiest way for college students to buy and sell within their campus community. Safe, fast, and free.</p>
          <div className="footer-social-icons">
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin"></i></a>
            <a href="#"><i className="fa-brands fa-github"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            {/* Experiment 7: Link for navigation */}
            {['Textbooks', 'Electronics', 'Cycles', 'Clothing', 'Furniture', 'Sports', 'Instruments'].map(cat => (
              <li key={cat}><Link to={`/buy?cat=${cat}`}>{cat}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/buy">Browse All</Link></li>
            <li><Link to="/sell">Sell an Item</Link></li>
            <li><Link to="/dashboard">My Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2026 CollegeMarketPlace. Made for students, by students.
      </div>
    </footer>
  );
}

export default Footer;
