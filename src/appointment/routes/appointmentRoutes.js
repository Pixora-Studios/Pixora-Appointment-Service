const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');
const appointmentValidator = require('../validator/appointmentValidator');
const clinicAuth = require('../../middleware/clinicAuth');
const { appointmentRateLimiter } = require('../../middleware/rateLimiter');

router.post(
  '/',
  appointmentRateLimiter,
  clinicAuth,
  appointmentValidator,
  appointmentController.createAppointment
);

module.exports = router;
