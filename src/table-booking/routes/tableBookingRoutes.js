const express = require('express');
const router = express.Router();
const tableBookingController = require('../controller/tableBookingController');
const tableBookingValidator = require('../validator/tableBookingValidator');
const clinicAuth = require('../../middleware/clinicAuth');
const { appointmentRateLimiter } = require('../../middleware/rateLimiter');

router.post(
  '/',
  appointmentRateLimiter,
  clinicAuth,
  tableBookingValidator,
  tableBookingController.createTableBooking
);

module.exports = router;
