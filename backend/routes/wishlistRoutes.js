// ============================================================
//  routes/wishlistRoutes.js
//  POST /api/wishlist/:productId  — Toggle like (add/remove)
//  GET  /api/wishlist/mine        — Get my wishlist
// ============================================================

const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ---- POST /api/wishlist/:productId — Toggle Like ----
router.post('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if already wishlisted
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });

    if (existing) {
      // Already liked — remove it (unlike)
      await existing.deleteOne();
      return res.json({ success: true, liked: false, message: 'Removed from wishlist.' });
    } else {
      // Not liked — add it
      await Wishlist.create({ user: req.user._id, product: productId });
      return res.json({ success: true, liked: true, message: 'Added to wishlist!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/wishlist/mine — Get My Wishlist ----
router.get('/mine', protect, async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate('product')   // fetch full product details
      .sort({ createdAt: -1 });

    // Filter out any deleted products
    const validItems = items.filter(i => i.product !== null);

    // De-duplicate (in case of any race or historical duplicates)
    const products = Array.from(
      new Map(validItems.map(i => [i.product._id.toString(), i.product])).values()
    );

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/wishlist/check/:productId — Check if liked ----
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const exists = await Wishlist.findOne({ user: req.user._id, product: req.params.productId });
    res.json({ success: true, liked: !!exists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
