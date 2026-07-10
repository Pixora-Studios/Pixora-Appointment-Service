const generateAppointmentEmail = (data) => {
  const {
    clinicName,
    patientName,
    patientPhone,
    patientEmail,
    preferredDate,
    preferredTime,
    treatmentRequired,
    additionalNotes,
    createdAt
  } = data;

  const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
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
          <h2>New Appointment Request</h2>
          <h3>${clinicName}</h3>
        </div>
        <div class="content">
          <div class="field"><span class="label">Patient Name:</span> ${patientName}</div>
          <div class="field"><span class="label">Patient Phone:</span> ${patientPhone}</div>
          ${patientEmail ? `<div class="field"><span class="label">Patient Email:</span> ${patientEmail}</div>` : ''}
          <div class="field"><span class="label">Preferred Date:</span> ${formattedDate}</div>
          <div class="field"><span class="label">Preferred Time:</span> ${preferredTime}</div>
          <div class="field"><span class="label">Treatment Required:</span> ${treatmentRequired}</div>
          ${additionalNotes ? `<div class="field"><span class="label">Additional Notes:</span> ${additionalNotes}</div>` : ''}
        </div>
        <div class="footer">
          <p>Submitted on: ${submittedAt}</p>
          <p>This is an automated notification from Pixora Appointment Service.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    New Appointment Request for ${clinicName}

    Patient Name: ${patientName}
    Patient Phone: ${patientPhone}
    ${patientEmail ? `Patient Email: ${patientEmail}` : ''}
    Preferred Date: ${formattedDate}
    Preferred Time: ${preferredTime}
    Treatment Required: ${treatmentRequired}
    ${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

    Submitted on: ${submittedAt}

    This is an automated notification from Pixora Appointment Service.
  `;

  return {
    subject: `New Appointment Request - ${clinicName}`,
    html,
    text
  };
};

module.exports = { generateAppointmentEmail };
