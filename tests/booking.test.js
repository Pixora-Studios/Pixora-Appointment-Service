const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Clinic = require('../src/models/Clinic');
const EmailProvider = require('../src/models/EmailProvider');
const Appointment = require('../src/appointment/model/Appointment');
const TableBooking = require('../src/table-booking/model/TableBooking');
const { EMAIL_PROVIDERS } = require('../src/config/constants');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed Email Providers
  const providers = [
    {
      providerName: EMAIL_PROVIDERS.BREVO,
      isActive: true,
      priority: 1,
      dailyLimit: 300,
    },
    {
      providerName: EMAIL_PROVIDERS.RESEND,
      isActive: true,
      priority: 2,
      dailyLimit: 100,
    },
    {
      providerName: EMAIL_PROVIDERS.HOSTINGER_SMTP,
      isActive: true,
      priority: 3,
      dailyLimit: 100,
    },
  ];

  for (const provider of providers) {
    await EmailProvider.create(provider);
  }

  process.env.MASTER_ADMIN_KEY = 'test_admin_key';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Pixora Generic Booking Service Integration Tests', () => {
  let clinicId;
  let apiKey;

  it('should successfully create a new clinic/merchant via Admin API', async () => {
    const res = await request(app)
      .post('/api/admin/clinics')
      .set('x-admin-key', 'test_admin_key')
      .send({
        clinicName: 'The Dental & Dining Club',
        doctorName: 'Dr. John & Chef Paul',
        clinicEmail: 'test-merchant@example.com',
        phone: '123-456-7890'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.clinicId).toBeDefined();
    expect(res.body.apiKey).toBeDefined();

    clinicId = res.body.clinicId;
    apiKey = res.body.apiKey;
  });

  it('should fail to book an appointment with missing/invalid API key', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        patientName: 'Jane Doe',
        patientPhone: '9876543210',
        preferredDate: '2026-08-12',
        preferredTime: '10:00 AM',
        treatmentRequired: 'Dental Checkup'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully book an appointment with valid key', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        patientName: 'Jane Doe',
        patientPhone: '9876543210',
        patientEmail: 'jane@example.com',
        preferredDate: '2026-08-12',
        preferredTime: '10:00 AM',
        treatmentRequired: 'Dental Checkup',
        additionalNotes: 'Please call before arrival.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.appointmentId).toBeDefined();
    expect(res.body.emailSent).toBe(false); // Since mock API keys are missing/invalid in test environment, they fail to send.
  });

  it('should fail appointment booking with validation errors', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        patientName: '',
        patientPhone: '9876543210',
        preferredDate: 'invalid-date',
        preferredTime: '10:00 AM',
        treatmentRequired: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should successfully book a table reservation with valid key', async () => {
    const res = await request(app)
      .post('/api/table-bookings')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        customerName: 'Alice Smith',
        customerPhone: '5555555555',
        customerEmail: 'alice@example.com',
        reservationDate: '2026-08-12',
        reservationTime: '7:30 PM',
        guestCount: 4,
        seatingPreference: 'Outdoor',
        specialRequest: 'No nuts in food.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.bookingId).toBeDefined();
  });

  it('should fail table booking with validation errors', async () => {
    const res = await request(app)
      .post('/api/table-bookings')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        customerName: '',
        customerPhone: '5555555555',
        reservationDate: 'invalid-date',
        reservationTime: '7:30 PM',
        guestCount: 0 // invalid guest count
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveLength(3); // name, date, guestCount
  });

  it('should retrieve all appointments via Admin API', async () => {
    const res = await request(app)
      .get('/api/admin/appointments')
      .set('x-admin-key', 'test_admin_key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.appointments).toHaveLength(1);
    expect(res.body.appointments[0].patientName).toBe('Jane Doe');
  });

  it('should retrieve all table bookings via Admin API', async () => {
    const res = await request(app)
      .get('/api/admin/table-bookings')
      .set('x-admin-key', 'test_admin_key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tableBookings).toHaveLength(1);
    expect(res.body.tableBookings[0].customerName).toBe('Alice Smith');
  });
});
