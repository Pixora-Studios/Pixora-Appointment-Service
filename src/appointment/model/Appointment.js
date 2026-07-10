const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../../config/constants');

const appointmentSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true,
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone is required'],
  },
  patientEmail: {
    type: String,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required'],
  },
  treatmentRequired: {
    type: String,
    required: [true, 'Treatment is required'],
  },
  additionalNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: Object.values(APPOINTMENT_STATUS),
    default: APPOINTMENT_STATUS.PENDING,
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

module.exports = mongoose.model('Appointment', appointmentSchema);
