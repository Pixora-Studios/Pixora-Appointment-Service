const tableBookingService = require('../service/tableBookingService');
const TableBooking = require('../model/TableBooking');
const { validationResult } = require('express-validator');

exports.createTableBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }

  try {
    const clinic = req.clinic; // Reused clinic/tenant context
    const booking = await tableBookingService.createTableBooking(clinic, req.body);

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      emailSent: booking.emailSent,
      emailProviderUsed: booking.emailProviderUsed
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminTableBookings = async (req, res, next) => {
  try {
    const { clinicId, status, from, to, emailSent } = req.query;
    const filter = {};

    if (clinicId) filter.clinicId = clinicId;
    if (status) filter.status = status;
    if (emailSent) filter.emailSent = emailSent === 'true';

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const bookings = await TableBooking.find(filter).populate('clinicId', 'restaurantName');
    res.json({ success: true, tableBookings: bookings });
  } catch (error) {
    next(error);
  }
};
