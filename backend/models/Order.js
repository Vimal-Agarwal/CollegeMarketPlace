const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerName:    { type: String, required: true },
    buyerEmail:   { type: String, required: true },

    product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName:  { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String, default: '' },

    // sellerRef lets seller fetch incoming orders
    sellerRef:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sellerName:   { type: String, default: '' },
    sellerEmail:  { type: String, default: '' },
    sellerPhone:  { type: String, default: '' },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
