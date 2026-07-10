const Appointment = require('../model/Appointment');
const emailService = require('../../email/emailService');

const createAppointment = async (clinic, appointmentData) => {
  const {
    patientName,
    patientPhone,
    patientEmail,
    preferredDate,
    preferredTime,
    treatmentRequired,
    additionalNotes
  } = appointmentData;

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

  return appointment;
};

module.exports = {
  createAppointment,
};
