// ============================================================
//  routes/orderRoutes.js
//  POST /api/orders              — Buyer: Place a new order
//  GET  /api/orders/mine         — Buyer: My placed orders
//  GET  /api/orders/incoming     — Seller: Orders on my products
//  PUT  /api/orders/:id/status   — Seller: Accept or Reject order
// ============================================================

const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ---- POST /api/orders — Buyer places an order ----
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ success: false, message: 'Product ID required.' });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.isSold)
      return res.status(400).json({ success: false, message: 'Product already sold.' });

    // ✅ NEW CHECK: Seller apna khud ka product buy nahi kar sakta
    // Agar logged-in user hi product ka seller hai toh order block karo
    if (product.sellerRef.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You not Buy your own Product ',
      });
    }

    // Prevent duplicate orders by same buyer for same product (pending/confirmed)
    const existingOrder = await Order.findOne({
      buyer: req.user._id,
      product: product._id,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active order for this product.',
      });
    }

    const order = await Order.create({
      buyer: req.user._id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      product: product._id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image || '',
      sellerRef: product.sellerRef,
      sellerName: product.seller?.name || '',
      sellerEmail: product.seller?.email || '',
      sellerPhone: product.seller?.phone || '',
      status: 'Pending',
    });

    res.status(201).json({ success: true, message: 'Order placed!', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/orders/mine — Buyer: see my orders ----
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/orders/incoming — Seller: orders on my products ----
router.get('/incoming', protect, async (req, res) => {
  try {
    // Find all orders where sellerRef matches logged-in user
    const orders = await Order.find({ sellerRef: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- PUT /api/orders/:id/status — Seller: Accept or Reject ----
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'Confirmed' or 'Cancelled'

    if (!['Confirmed', 'Cancelled'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status.' });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    // Only the seller of this product can update
    if (order.sellerRef.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });

    // Update order status
    order.status = status;
    await order.save();

    // If seller ACCEPTED — mark product as sold so it hides from Browse
    if (status === 'Confirmed') {
      await Product.findByIdAndUpdate(order.product, { isSold: true });
    }

    // If seller REJECTED — cancel other pending orders for same product? Optional.
    res.json({ success: true, message: `Order ${status}!`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
