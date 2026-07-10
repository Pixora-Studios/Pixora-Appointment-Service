const { body } = require('express-validator');

const appointmentValidator = [
  body('patientName').notEmpty().withMessage('Patient name is required'),
  body('patientPhone').notEmpty().withMessage('Patient phone is required'),
  body('patientEmail').optional().isEmail().withMessage('Valid email is required if provided'),
  body('preferredDate').isISO8601().withMessage('Valid preferred date is required (ISO8601)'),
  body('preferredTime').notEmpty().withMessage('Preferred time is required'),
  body('treatmentRequired').notEmpty().withMessage('Treatment required is required'),
];

module.exports = appointmentValidator;
