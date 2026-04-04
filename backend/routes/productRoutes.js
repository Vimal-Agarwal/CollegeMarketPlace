// ============================================================
//  productRoutes.js — Product REST API Routes
//
//  GET    /api/products           — Read all products
//  POST   /api/products           — Create a new product
//  GET    /api/products/my/listings — Get logged-in user's products
//  GET    /api/products/:id       — Read one product
//  PUT    /api/products/:id       — Update a product
//  DELETE /api/products/:id       — Delete a product
// ============================================================

const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
//  GET /api/products — Read all products
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build Mongoose query based on URL params
    let query = { isSold: false };  // Hide sold products from browse
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort option
    let sortOption = { createdAt: -1 };         // default: newest first
    if (sort === 'low') sortOption = { price: 1 };
    if (sort === 'high') sortOption = { price: -1 };

    // Product.find() — READ from MongoDB
    const products = await Product.find(query).sort(sortOption);

    //  Send JSON response
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  GET /api/products/my/listings — Get current user's products
//   Protected GET route
//   Product.find({ sellerRef }) — filtered READ
// ============================================================
router.get('/my/listings', protect, async (req, res) => {
  try {
    // Experiment 10: Find only products where sellerRef matches logged-in user
    const products = await Product.find({ sellerRef: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  GET /api/products/:id — Read a single product
//  GET with URL parameter
// Product.findById() — READ one document
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    //  findById() — READ one document from MongoDB
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  POST /api/products — Create a new product
// ============================================================
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, description, price, image, phone } = req.body;

    // Validate required fields
    if (!name || !category || !description || !price) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    //  Product.create() — INSERT document into MongoDB
    const product = await Product.create({
      name,
      category,
      description,
      price: Number(price),
      image: image || '',
      seller: {
        name: req.user.name,
        email: req.user.email,
        phone: phone || '',
      },
      sellerRef: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Product listed successfully!', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  PUT /api/products/:id — Update a product
// ============================================================
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Only the seller can update their own product
    if (product.sellerRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product.' });
    }

    //  findByIdAndUpdate() — UPDATE document in MongoDB
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,            // return the updated document
      runValidators: true,  // run schema validators on update
    });

    res.json({ success: true, message: 'Product updated!', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  DELETE /api/products/:id — Delete a product
// ============================================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Only the seller can delete their own product
    if (product.sellerRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product.' });
    }

    //  deleteOne() — REMOVE document from MongoDB
    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
