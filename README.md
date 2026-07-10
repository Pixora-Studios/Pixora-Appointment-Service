# Pixora Booking & Notification Service

A centralized, generic, multi-tenant notification and booking service capable of handling both **Dental Clinic Appointments** and **Restaurant/Cafe Table Reservations**.

Designed for scalability and high availability, the service receives bookings from individual tenant websites, persists them in MongoDB, and triggers real-time email notifications to registered business emails using an advanced, fail-safe **multi-provider fallback system** (Brevo ➔ Resend ➔ Hostinger SMTP).

---

## Key Features
- 🌟 **Dual Capability:** Completely modular design supporting dental appointments and restaurant reservations in a unified backend.
- ⚙️ **Modular Domain Structure:** Grouped by concern (Appointments, Table Bookings, Emails, Providers, and Templates) for high maintainability.
- 🔐 **Multi-Tenant Authentication:** Dynamic dual-model authentication looking up tenants (Clinics or Restaurants) securely via SHA-256 hashed API keys.
- 📬 **Reliable Email Fallback Chain:** Prioritizes active providers based on priority, enforces daily sending limits, tracks errors, and seamlessly cascades on failure.
- ⏱️ **Advanced Rate Limiting:** Enforces strict limits for clients and administrators, preventing spam and DoS attacks.
- 🛡️ **Security Out-of-the-Box:** Implements Helmet headers, secure CORS origins, parameter validation, production-safe error masking, and sensitive-data log redaction.

---

## Repository Directory Layout

The codebase has been refactored into a highly clean, modular domain architecture:

```
src/
 ├── appointment/              # Appointment Booking Module
 │    ├── controller/          # Appointment Express Controllers
 │    │    └── appointmentController.js
 │    ├── model/               # Appointment Mongoose Schema
 │    │    └── Appointment.js
 │    ├── routes/              # Appointment API routing
 │    │    └── appointmentRoutes.js
 │    ├── service/             # Appointment creation & email trigger logic
 │    │    └── appointmentService.js
 │    └── validator/           # Appointment express-validator schemas
 │         └── appointmentValidator.js
 │
 ├── table-booking/            # Restaurant Reservation Module
 │    ├── controller/          # Table Booking & Restaurant management controllers
 │    │    ├── tableBookingController.js
 │    │    └── restaurantController.js
 │    ├── model/               # Restaurant & TableBooking schemas
 │    │    ├── TableBooking.js
 │    │    └── Restaurant.js
 │    ├── routes/              # Table Booking API routing
 │    │    └── tableBookingRoutes.js
 │    ├── service/             # Table booking persistence & email trigger logic
 │    │    └── tableBookingService.js
 │    └── validator/           # Table Booking express-validator schemas
 │         └── tableBookingValidator.js
 │
 ├── email/                    # Centralized Fallback Email Module
 │    └── emailService.js      # Resets counters, sorts providers, handles cascading fallbacks
 │
 ├── providers/                # Email Provider Integration Handlers
 │    ├── brevoProvider.js     # Brevo SDK Integration
 │    ├── resendProvider.js    # Resend SDK Integration
 │    └── nodemailerProvider.js# SMTP NodeMailer Integration (Hostinger SMTP)
 │
 ├── templates/                # HTML/Text Email Layout Generative Functions
 │    ├── appointmentNotification.js
 │    └── tableBookingNotification.js
 │
 ├── middleware/               # Cross-Cutting Core Middlewares
 │    ├── adminAuth.js         # Master Admin Authentication
 │    ├── clinicAuth.js        # Tenant Bearer API Key Authentication (Dual Clinic/Restaurant lookup)
 │    ├── errorHandler.js      # Centralized error mapping and production stack trace masking
 │    └── rateLimiter.js       # IP-based API rate limits (Admin & Client)
 │
 ├── utils/                    # Shared Helper Functions
 │    ├── apiKeyService.js     # Generation, hashing, and prefixing of API keys
 │    └── logger.js            # Console logging with auto-redaction of secrets & tokens
 │
 ├── config/                   # Global Configuration & Settings
 │    ├── constants.js         # Shared statuses and prefixes constants
 │    └── db.js                # Database connection configuration using Mongoose
 │
 ├── app.js                    # Express Application assembly, CORS, and routing mounting
 └── server.js                 # Server bootstrapping, database connection, and email provider seeding
```

---

## Technology Stack
* **Runtime:** Node.js (v14+)
* **Framework:** Express.js
* **Persistence:** MongoDB with Mongoose ODM
* **Email Protocols & SDKs:** Nodemailer (Hostinger Titan Mail), Resend SDK, Brevo SDK (`@getbrevo/brevo`)
* **Security & Utility:** Helmet, CORS, Express Rate Limit, Express Validator, Morgan, Dotenv
* **Testing:** Jest, Supertest, MongoDB Memory Server (`mongodb-memory-server`)

---

## Installation & Environment Setup

### 1. Prerequisite Checklist
- Ensure you have **Node.js** (v14 or newer) installed.
- Ensure you have a running instance of **MongoDB** (local or Atlas cloud).

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the root directory based on `.env.example`. Here is an overview of the key-value pairs:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pixora-booking

# Security Keys
MASTER_ADMIN_KEY=your_long_random_master_admin_key

# CORS Whitelist (comma-separated, leave blank to reject all cross-origin requests while allowing curl/mobile apps)
ALLOWED_ORIGINS=http://localhost:3000,https://myrestaurant.com

# Email Providers Credentials
BREVO_API_KEY=your_brevo_api_key
RESEND_API_KEY=your_resend_api_key

# Hostinger SMTP
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465
HOSTINGER_SMTP_SECURE=true
HOSTINGER_SMTP_USER=no-reply@pixorastudios.com
HOSTINGER_SMTP_PASS=your_hostinger_mailbox_password

# Email Senders Global Properties
FROM_NAME=Pixora STUDIOS
FROM_EMAIL=no-reply@pixorastudios.com
```

### 4. Running the Server
```bash
# Run in Development mode
npm run dev

# Run in Production mode
npm start
```
*Upon starting, the server automatically connects to MongoDB and seeds the necessary email provider models (`brevo`, `resend`, `hostinger-smtp`) into your database.*

---

## Authentication Protocols

The service implements two strict tiers of authentication:

### 1. Master Admin Token Authentication
Used exclusively for administrative operations (managing clinics, restaurants, and viewing all system-wide bookings).
- **Header Field:** `x-admin-key: <MASTER_ADMIN_KEY>`
- Key is configured statically via your `.env` file.

### 2. Tenant Bearer API Key Authentication
Used by individual dental clinic or restaurant websites to submit booking requests.
- **Header Field:** `Authorization: Bearer pix_live_<32 random hex characters>`
- Keys are dynamically generated when an admin registers a Clinic or Restaurant.
- **Safety Rule:** The raw API key is displayed **ONLY ONCE** upon registration or regeneration, and is stored securely in MongoDB as a SHA-256 hash.

---

## Administrative Endpoints Reference

All administrative endpoints require the `x-admin-key` header for access.

### 1. Clinic Management

#### **Create a Clinic**
* `POST /api/admin/clinics`
```json
{
  "clinicName": "Pixora Dental - Downtown",
  "doctorName": "Dr. Susan Smith",
  "clinicEmail": "downtown-dental@example.com",
  "phone": "555-019-9231"
}
```
* **Response (201 Created):** Contains the unretrievable `apiKey` Bearer token. Store this securely immediately.

#### **List Clinics**
* `GET /api/admin/clinics`
* Returns a list of all registered clinics (excluding sensitive `keyHash` values).

#### **Regenerate Clinic API Key**
* `PATCH /api/admin/clinics/:id/regenerate-key`
* Generates and returns a fresh, unretrievable API key for the clinic.

#### **Toggle Clinic Status**
* `PATCH /api/admin/clinics/:id/disable` (Deactivates clinic, rejecting future booking requests)
* `PATCH /api/admin/clinics/:id/enable` (Re-enables deactivated clinic)

---

### 2. Restaurant Management

#### **Create a Restaurant/Cafe**
* `POST /api/admin/restaurants`
```json
{
  "restaurantName": "Pixora Cafe - Midtown",
  "contactName": "Chef Marcus Paul",
  "restaurantEmail": "midtown-cafe@example.com",
  "phone": "555-014-4829"
}
```
* **Response (201 Created):** Returns the unretrievable `apiKey` Bearer token.

#### **List Restaurants**
* `GET /api/admin/restaurants`
* Lists all restaurants (excluding `keyHash` fields).

#### **Regenerate Restaurant API Key**
* `PATCH /api/admin/restaurants/:id/regenerate-key`

#### **Toggle Restaurant Status**
* `PATCH /api/admin/restaurants/:id/disable` (Deactivates restaurant, rejecting bookings)
* `PATCH /api/admin/restaurants/:id/enable` (Re-enables restaurant)

---

### 3. Email Providers Setup & Stats
The admin panel provides complete visibility and control over the active email senders in the system.

* **Check Statuses & Counters:** `GET /api/admin/providers`
* **Toggle Provider (On/Off):** `PATCH /api/admin/providers/:providerName/toggle` (Send body: `{ "isActive": false }`)
* **Change Fallback Priority:** `PATCH /api/admin/providers/:providerName/priority` (Send body: `{ "priority": 1 }`)
* **Perform Isolated Test Send:** `POST /api/admin/providers/:providerName/test` (Send body: `{ "testRecipientEmail": "hello@pixora.com" }`)
* **Reset Daily Limit Counters:** `POST /api/admin/providers/reset-counters`

---

### 4. Admin Booking Retrieval

Admins can query, filter, and audit all system-wide bookings with support for rich query parameters (`clinicId`, `status`, `from`, `to`, `emailSent`).

* **View All Clinic Appointments:** `GET /api/admin/appointments`
* **View All Restaurant Reservations:** `GET /api/admin/table-bookings`

---

## Client Booking Endpoints (POST)

All booking submissions require a Bearer token generated during tenant creation.

### 1. Dental Appointments (`POST /api/appointments`)
Used by dental clinic websites.

**Headers:**
```http
Authorization: Bearer pix_live_<clinic_api_key>
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john@example.com",
  "preferredDate": "2026-07-20",
  "preferredTime": "11:00 AM",
  "treatmentRequired": "Dental Fillings",
  "additionalNotes": "Tooth pain on left side"
}
```

* **Required Fields:** `patientName`, `patientPhone`, `preferredDate` (ISO8601), `preferredTime`, `treatmentRequired`
* **Optional Fields:** `patientEmail` (Email), `additionalNotes`

**Success Response (201 Created):**
```json
{
  "success": true,
  "appointmentId": "64bc1f2...",
  "emailSent": true,
  "emailProviderUsed": "brevo"
}
```

---

### 2. Restaurant Table Reservations (`POST /api/table-bookings`)
Used by restaurant or cafe websites.

**Headers:**
```http
Authorization: Bearer pix_live_<restaurant_api_key>
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "9999999999",
  "customerEmail": "john@example.com",
  "reservationDate": "2026-08-12",
  "reservationTime": "7:30 PM",
  "guestCount": 4,
  "seatingPreference": "Indoor",
  "specialRequest": "Birthday celebration"
}
```

* **Required Fields:** `customerName`, `customerPhone`, `reservationDate` (ISO8601), `reservationTime`, `guestCount` (Integer)
* **Optional Fields:** `customerEmail` (Email), `seatingPreference` (String), `specialRequest` (String)

**Success Response (201 Created):**
```json
{
  "success": true,
  "bookingId": "64bc2a5...",
  "emailSent": true,
  "emailProviderUsed": "brevo"
}
```

---

## Multi-Provider Email Fallback System

Email notification delivery is completely automated and designed to handle individual provider outages seamlessly:

1. **Daily Limits Enforcement:** Each provider has a dynamic `sentToday` counter tracked in MongoDB. When a provider reaches its designated `dailyLimit`, the email service skips it. (Brevo default limit is `300`, Resend `100`, Hostinger `100`).
2. **Provider Prioritization:** Providers are queried in ascending order of their `priority` integer (e.g. `1` is attempted first).
3. **Outage Recovery / Fallback Chain:** If the primary provider (Brevo) encounters an API error, credential issue, or limit exhaustion, the error is securely logged. The service **immediately attempts** the secondary provider (Resend). If that fails, it falls back to the third provider (Hostinger SMTP).
4. **Best-Effort Delivery:** On success, the utilized provider's `sentToday` counter is incremented, and `emailSent: true` is saved with the booking. If all active providers fail or are exhausted, the booking is still successfully persisted in the database with `emailSent: false` and the fallback error captured in the booking's `emailError` field.

---

## Testing & Automated Verification

The repository contains an automated integration test suite that tests all controller flows, validations, tenant authorizations, and mock email service trigger actions in-memory.

Run the test suite using Jest:
```bash
npm test
```

Tests run sequentially on a virtual database spun up dynamically via `mongodb-memory-server` and simulated via `supertest`, guaranteeing zero side effects on your production database.

---

## Error Handling & Reference

The service utilizes standardized JSON error structures and HTTP status codes:

| Status Code | Meaning | Common Cause |
| --- | --- | --- |
| **400** | Bad Request | Validation failures (e.g., missing required fields, non-ISO dates). |
| **401** | Unauthorized | Invalid or missing admin x-admin-key or bearer API Key. |
| **404** | Not Found | Requested entity (Clinic, Restaurant, Provider) does not exist. |
| **429** | Too Many Requests | Rate limit threshold exceeded for admin or client booking endpoints. |
| **500** | Internal Server Error | Core server exception. Stack traces are masked automatically if `NODE_ENV=production`. |
