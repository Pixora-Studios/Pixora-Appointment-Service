const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  restaurantEmail: {
    type: String,
    required: [true, 'Restaurant email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
