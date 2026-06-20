const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { body } = require('express-validator');

const adminAuth = require('./middleware/adminAuth');
const clinicAuth = require('./middleware/clinicAuth');
const { adminRateLimiter, appointmentRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const clinicController = require('./controllers/clinicController');
const providerController = require('./controllers/providerController');
const appointmentController = require('./controllers/appointmentController');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Admin Routes
const adminRouter = express.Router();
adminRouter.use(adminAuth);
adminRouter.use(adminRateLimiter);

adminRouter.post('/clinics', clinicController.createClinic);
adminRouter.get('/clinics', clinicController.getAllClinics);
adminRouter.patch('/clinics/:id/regenerate-key', clinicController.regenerateKey);
adminRouter.patch('/clinics/:id/disable', clinicController.disableClinic);
adminRouter.patch('/clinics/:id/enable', clinicController.enableClinic);
adminRouter.get('/appointments', clinicController.getAdminAppointments);

adminRouter.get('/providers', providerController.getProviders);
adminRouter.patch('/providers/:providerName/toggle', providerController.toggleProvider);
adminRouter.patch('/providers/:providerName/priority', providerController.updatePriority);
adminRouter.post('/providers/:providerName/test', providerController.testProvider);
adminRouter.post('/providers/reset-counters', providerController.resetCounters);

app.use('/api/admin', adminRouter);

// Clinic-facing Routes
app.post(
  '/api/appointments',
  appointmentRateLimiter,
  clinicAuth,
  [
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('patientPhone').notEmpty().withMessage('Patient phone is required'),
    body('patientEmail').optional().isEmail().withMessage('Valid email is required if provided'),
    body('preferredDate').isISO8601().withMessage('Valid preferred date is required (ISO8601)'),
    body('preferredTime').notEmpty().withMessage('Preferred time is required'),
    body('treatmentRequired').notEmpty().withMessage('Treatment required is required'),
  ],
  appointmentController.createAppointment
);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'UP' }));

// Error Handler
app.use(errorHandler);

module.exports = app;
