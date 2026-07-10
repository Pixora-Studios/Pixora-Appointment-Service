const { body } = require('express-validator');

const tableBookingValidator = [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerEmail').optional().isEmail().withMessage('Valid email is required if provided'),
  body('reservationDate').isISO8601().withMessage('Valid reservation date is required (ISO8601)'),
  body('reservationTime').notEmpty().withMessage('Reservation time is required'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be an integer of at least 1'),
  body('seatingPreference').optional().isString().withMessage('Seating preference must be a string'),
  body('specialRequest').optional().isString().withMessage('Special request must be a string'),
];

module.exports = tableBookingValidator;
