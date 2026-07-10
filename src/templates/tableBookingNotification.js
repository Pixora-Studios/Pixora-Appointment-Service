const generateTableBookingEmail = (data) => {
  const {
    clinicName,
    customerName,
    customerPhone,
    customerEmail,
    reservationDate,
    reservationTime,
    guestCount,
    seatingPreference,
    specialRequest,
    createdAt
  } = data;

  const formattedDate = new Date(reservationDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const submittedAt = new Date(createdAt).toLocaleString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .header { background: #f4f4f4; padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
        .content { margin-top: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Table Booking Request</h2>
          <h3>${clinicName}</h3>
        </div>
        <div class="content">
          <div class="field"><span class="label">Customer Name:</span> ${customerName}</div>
          <div class="field"><span class="label">Customer Phone:</span> ${customerPhone}</div>
          ${customerEmail ? `<div class="field"><span class="label">Customer Email:</span> ${customerEmail}</div>` : ''}
          <div class="field"><span class="label">Reservation Date:</span> ${formattedDate}</div>
          <div class="field"><span class="label">Reservation Time:</span> ${reservationTime}</div>
          <div class="field"><span class="label">Guest Count:</span> ${guestCount}</div>
          ${seatingPreference ? `<div class="field"><span class="label">Seating Preference:</span> ${seatingPreference}</div>` : ''}
          ${specialRequest ? `<div class="field"><span class="label">Special Request:</span> ${specialRequest}</div>` : ''}
        </div>
        <div class="footer">
          <p>Submitted on: ${submittedAt}</p>
          <p>This is an automated notification from Pixora Booking Service.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    New Table Booking Request for ${clinicName}

    Customer Name: ${customerName}
    Customer Phone: ${customerPhone}
    ${customerEmail ? `Customer Email: ${customerEmail}` : ''}
    Reservation Date: ${formattedDate}
    Reservation Time: ${reservationTime}
    Guest Count: ${guestCount}
    ${seatingPreference ? `Seating Preference: ${seatingPreference}` : ''}
    ${specialRequest ? `Special Request: ${specialRequest}` : ''}

    Submitted on: ${submittedAt}

    This is an automated notification from Pixora Booking Service.
  `;

  return {
    subject: `New Table Booking Reservation - ${clinicName}`,
    html,
    text
  };
};

module.exports = { generateTableBookingEmail };
