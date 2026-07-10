const mongoose = require('mongoose');

const tableBookingSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
  },
  customerEmail: {
    type: String,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
  },
  reservationDate: {
    type: Date,
    required: [true, 'Reservation date is required'],
  },
  reservationTime: {
    type: String,
    required: [true, 'Reservation time is required'],
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1'],
  },
  seatingPreference: {
    type: String,
  },
  specialRequest: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailProviderUsed: {
    type: String,
  },
  emailError: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TableBooking', tableBookingSchema);
