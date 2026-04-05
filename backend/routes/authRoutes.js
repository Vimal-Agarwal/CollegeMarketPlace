// ============================================================
//  routes/authRoutes.js — Authentication Routes
//
//  POST /api/auth/signup  — Register a new user
//  POST /api/auth/login   — Login and get token
//  GET  /api/auth/me      — Get logged-in user info
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ============================================================
//  POST /api/auth/signup — Create new user account
//  POST route receiving JSON body
//  User.create() — CREATE in MongoDB
// ============================================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, collegeId } = req.body;

    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if email already in use
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // User.create() — INSERT new document into MongoDB
    // The password is automatically hashed by the pre-save hook in User.js
    const user = await User.create({ name, email, password, collegeId });

    // Return JSON with user data + token
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  POST /api/auth/login — Login with email + password
//  POST route with JSON response
//  User.findOne() — READ from MongoDB
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Experiment 10: User.findOne() — READ user by email
    // .select('+password') includes the hidden password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Compare entered password with stored hash (uses bcrypt)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  GET /api/auth/me — Get current user info
//   Protected GET route
//   User.findById() — READ one document
// ============================================================
router.get('/me', protect, async (req, res) => {
  try {
    // Experiment 10: findById() — read single user
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
