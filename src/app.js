const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const adminAuth = require('./middleware/adminAuth');
const { adminRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const clinicController = require('./controllers/clinicController');
const providerController = require('./controllers/providerController');
const tableBookingController = require('./table-booking/controller/tableBookingController');

const appointmentRoutes = require('./appointment/routes/appointmentRoutes');
const tableBookingRoutes = require('./table-booking/routes/tableBookingRoutes');

const app = express();

// Middleware
app.use(helmet());

// Configurable CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

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
adminRouter.get('/table-bookings', tableBookingController.getAdminTableBookings);

adminRouter.get('/providers', providerController.getProviders);
adminRouter.patch('/providers/:providerName/toggle', providerController.toggleProvider);
adminRouter.patch('/providers/:providerName/priority', providerController.updatePriority);
adminRouter.post('/providers/:providerName/test', providerController.testProvider);
adminRouter.post('/providers/reset-counters', providerController.resetCounters);

app.use('/api/admin', adminRouter);

// Clinic-facing modular Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/table-bookings', tableBookingRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'UP' }));

// Error Handler
app.use(errorHandler);

module.exports = app;
