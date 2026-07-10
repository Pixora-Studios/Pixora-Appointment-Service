const TableBooking = require('../model/TableBooking');
const emailService = require('../../email/emailService');

const createTableBooking = async (clinic, bookingData) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    reservationDate,
    reservationTime,
    guestCount,
    seatingPreference,
    specialRequest
  } = bookingData;

  const booking = await TableBooking.create({
    clinicId: clinic._id,
    customerName,
    customerPhone,
    customerEmail,
    reservationDate,
    reservationTime,
    guestCount,
    seatingPreference,
    specialRequest
  });

  // Send email notification (best-effort)
  const emailResult = await emailService.sendTableBookingEmail(
    {
      clinicName: clinic.clinicName,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      reservationTime,
      guestCount,
      seatingPreference,
      specialRequest,
      createdAt: booking.createdAt
    },
    clinic.clinicEmail
  );

  // Update booking with email results
  booking.emailSent = emailResult.success;
  if (emailResult.success) {
    booking.emailProviderUsed = emailResult.providerUsed;
  } else {
    booking.emailError = emailResult.error;
  }
  await booking.save();

  return booking;
};

module.exports = {
  createTableBooking,
};
