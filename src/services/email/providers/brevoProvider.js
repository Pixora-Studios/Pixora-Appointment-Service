const { BrevoClient } = require('@getbrevo/brevo');
const { generateAppointmentEmail } = require('../templates/appointmentNotification');

const sendAppointmentEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateAppointmentEmail(data);

  if (!process.env.BREVO_API_KEY) {
    throw new Error('Brevo API key is missing');
  }

  const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      textContent: text,
      sender: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
      to: [{ email: to }],
    });

    return { success: true };
  } catch (error) {
    const errorMsg = error?.body?.message || error?.message || 'Unknown Brevo error';
    throw new Error(`Brevo Error: ${errorMsg}`);
  }
};

module.exports = { sendAppointmentEmail };
