# Pixora Appointment Service

A centralized appointment notification service for multiple dental clinics under PixoraStudios.

## Overview
This service acts as a middleman between clinic websites and clinic staff. When an appointment is booked on a clinic's website, the website calls this service's API. The service then:
1. Stores the appointment details in MongoDB.
2. Sends an email notification to the clinic's registered email address.
3. Utilizes a multi-provider fallback system (Brevo, Resend, Hostinger SMTP) to ensure high delivery rates.

## Setup

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in the required credentials.
4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Authentication

### Master Admin Key
Used for managing clinics and email providers.
- **Header:** `x-admin-key: <MASTER_ADMIN_KEY>`
- Managed via the `.env` file.

### Clinic API Key
One per clinic, used for booking appointments.
- **Header:** `Authorization: Bearer pix_live_...`
- **Format:** `pix_live_<32 random hex chars>`
- **Note:** Shown **ONLY ONCE** at creation or regeneration. Never retrievable again.

## Email Providers — Setup & Management

### Provider Configuration
- **Brevo:** Obtain API key from [app.brevo.com](https://app.brevo.com) under Settings > SMTP & API > API Keys.
- **Resend:** Obtain API key from [resend.com/api-keys](https://resend.com/api-keys).
- **Hostinger/Titan Mail:** Log into hPanel > Emails > select your mailbox > Manage > Configuration Settings > Manual Configuration to find your exact SMTP host, port, and SSL setting. Use your mailbox's regular login password — there is no separate app password for Hostinger mail.

### Fallback & Priority System
Providers are tried in order of their `priority` (lower number first). If a provider fails (auth error, rate limit) or reaches its `dailyLimit`, the service automatically attempts the next active provider in the chain. (Brevo, Resend, and Hostinger/Titan Mail are configured by default).

### Provider Operations
- **Check Status:** `GET /api/admin/providers`
- **Toggle On/Off:** `PATCH /api/admin/providers/:providerName/toggle`
- **Change Priority:** `PATCH /api/admin/providers/:providerName/priority`
- **Test Provider:** `POST /api/admin/providers/:providerName/test`

## Integrating a Clinic Website

### Endpoint: `POST /api/appointments`

**Headers:**
```
Authorization: Bearer pix_live_...
Content-Type: application/json
```

**Body:**
```json
{
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john@example.com",
  "preferredDate": "2024-07-20",
  "preferredTime": "11:00 AM",
  "treatmentRequired": "Dental Fillings",
  "additionalNotes": "Tooth pain on left side"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "appointmentId": "...",
  "emailSent": true,
  "emailProviderUsed": "brevo"
}
```

### Integration Example (JavaScript/Fetch)
```javascript
const bookAppointment = async (formData) => {
  try {
    const response = await fetch('https://api.pixora.com/api/appointments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_CLINIC_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('Appointment booked!', data.appointmentId);
    } else {
      console.error('Booking failed:', data.errors || data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

## Admin Operations (Postman)

### Clinic Management
- `POST /api/admin/clinics`: Create a new clinic.
- `GET /api/admin/clinics`: List all clinics.
- `PATCH /api/admin/clinics/:id/regenerate-key`: Issue a new API key.
- `PATCH /api/admin/clinics/:id/disable`: Disable a clinic.
- `PATCH /api/admin/clinics/:id/enable`: Enable a clinic.
- `GET /api/admin/appointments`: View all appointments (supports filters: `clinicId`, `status`, `from`, `to`, `emailSent`).

## Appointment Statuses
| Status | Meaning |
| --- | --- |
| `pending` | Initial status upon booking. |
| `confirmed` | Appointment confirmed by clinic. |
| `cancelled` | Appointment cancelled. |
| `completed` | Appointment completed. |

## Error Reference
| Status Code | Meaning | Typical Cause |
| --- | --- | --- |
| 400 | Bad Request | Validation error (missing fields, invalid format). |
| 401 | Unauthorized | Missing or invalid API key / Admin key. |
| 429 | Too Many Requests | Rate limit exceeded. |
| 500 | Internal Server Error | Server error or provider exhaustion (check `emailSent` in response). |
