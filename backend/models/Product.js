// ============================================================
//  models/Product.js — Mongoose Product Schema
// ============================================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Each field has a type and optional validation rules
    name: {
      type: String,
      required: [true, 'Product name is required'],  // built-in validation
      trim: true,                                     // remove extra spaces
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // Experiment 10: enum validation — only these values allowed
      enum: ['Textbooks', 'Electronics', 'Cycles', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Instruments', 'Others'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,   // base64 string
      default: '',
    },
    // Embedded seller info (stored inside the product document)
    seller: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    // Reference to the User who listed this product
    sellerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    //  timestamps option — auto-adds createdAt & updatedAt fields
    timestamps: true,
  }
);

// Text index — enables full-text search on name and description
productSchema.index({ name: 'text', description: 'text' });

// mongoose.model() — creates the 'Product' collection in MongoDB
module.exports = mongoose.model('Product', productSchema);
