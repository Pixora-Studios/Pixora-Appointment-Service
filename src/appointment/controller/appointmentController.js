const appointmentService = require('../service/appointmentService');
const { validationResult } = require('express-validator');

exports.createAppointment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }

  try {
    const clinic = req.clinic; // Set by clinicAuth middleware
    const appointment = await appointmentService.createAppointment(clinic, req.body);

    res.status(201).json({
      success: true,
      appointmentId: appointment._id,
      emailSent: appointment.emailSent,
      emailProviderUsed: appointment.emailProviderUsed
    });
  } catch (error) {
    next(error);
  }
};
