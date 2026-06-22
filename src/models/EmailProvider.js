const mongoose = require('mongoose');
const { EMAIL_PROVIDERS } = require('../config/constants');

const emailProviderSchema = new mongoose.Schema({
  providerName: {
    type: String,
    required: true,
    enum: Object.values(EMAIL_PROVIDERS),
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  dailyLimit: {
    type: Number,
    required: true,
  },
  sentToday: {
    type: Number,
    default: 0,
  },
  lastResetDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  lastUsedAt: {
    type: Date,
  },
  lastError: {
    type: String,
  },
  lastErrorAt: {
    type: Date,
  },
});

module.exports = mongoose.model('EmailProvider', emailProviderSchema);
