// ============================================================
//  server.js — Express Server
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// ============================================================
//  MIDDLEWARE
// ============================================================

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
//  Every request is logged to logs/visits.txt
// ============================================================

// Make sure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);  // fs.mkdirSync — create folder if missing
}

app.use((req, res, next) => {
  // Build a log line with timestamp, method, and URL
  const logLine = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;

  //  fs.appendFile — add a line to the log file
  // This is non-blocking (uses a callback), so it doesn't slow down requests
  fs.appendFile(
    path.join(logsDir, 'visits.txt'),
    logLine,
    (err) => { if (err) console.error('Log write error:', err); }
  );

  console.log(logLine.trim()); // also print to terminal
  next();
});

// ============================================================
//   Route to READ the log file (fs.readFile)
//  GET /api/logs — returns the contents of visits.txt
// ============================================================
app.get('/api/logs', (req, res) => {
  const logPath = path.join(logsDir, 'visits.txt');

  //  fs.readFile — read file contents as text
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not read log file' });
    }
    // Return the last 50 lines (most recent visits)
    const lines = data.trim().split('\n').slice(-50).join('\n');
    res.json({ success: true, logs: lines });
  });
});

// ============================================================
//  REST API Routes
//  GET, POST, PUT, DELETE handled inside each route file
// ============================================================

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check — simple test endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CollegeMarketPlace API is running!', time: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ============================================================
//   Connect to MongoDB using Mongoose
// ============================================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected:', process.env.MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// ============================================================
//  START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 View logs:    http://localhost:${PORT}/api/logs`);
  });
});

module.exports = app;
