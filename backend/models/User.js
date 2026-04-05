// ============================================================
//  models/User.js — Mongoose User Schema
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                    // no two users can share an email
      lowercase: true,                 // always store as lowercase
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,                   // exclude from queries by default
    },
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook — runs before saving a User document
// Hashes the password before it gets stored in MongoDB
userSchema.pre('save', async function (next) {
  // Only hash if password was changed (not on every save)
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Schema method — compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
