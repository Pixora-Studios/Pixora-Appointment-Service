const Appointment = require('../models/Appointment');
const emailService = require('../services/email/emailService');
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
    const {
      patientName,
      patientPhone,
      patientEmail,
      preferredDate,
      preferredTime,
      treatmentRequired,
      additionalNotes
    } = req.body;

    const clinic = req.clinic; // Set by clinicAuth middleware

    const appointment = await Appointment.create({
      clinicId: clinic._id,
      patientName,
      patientPhone,
      patientEmail,
      preferredDate,
      preferredTime,
      treatmentRequired,
      additionalNotes,
    });

    // Send email notification (best-effort)
    const emailResult = await emailService.sendAppointmentEmail(
      {
        clinicName: clinic.clinicName,
        patientName,
        patientPhone,
        patientEmail,
        preferredDate,
        preferredTime,
        treatmentRequired,
        additionalNotes,
        createdAt: appointment.createdAt
      },
      clinic.clinicEmail
    );

    // Update appointment with email results
    appointment.emailSent = emailResult.success;
    if (emailResult.success) {
      appointment.emailProviderUsed = emailResult.providerUsed;
    } else {
      appointment.emailError = emailResult.error;
    }
    await appointment.save();

    res.status(201).json({
      success: true,
      appointmentId: appointment._id,
      emailSent: emailResult.success,
      emailProviderUsed: appointment.emailProviderUsed
    });
  } catch (error) {
    next(error);
  }
};
