const Brevo = require('@getbrevo/brevo');
const { generateAppointmentEmail } = require('../templates/appointmentNotification');

const sendAppointmentEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateAppointmentEmail(data);

  if (!process.env.BREVO_API_KEY) {
    throw new Error('Brevo API key is missing');
  }

  const defaultClient = Brevo.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new Brevo.TransactionalEmailsApi();
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.textContent = text;
  sendSmtpEmail.sender = { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL };
  sendSmtpEmail.to = [{ email: to }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.body?.message || error.message;
    throw new Error(`Brevo Error: ${errorMsg}`);
  }
};

module.exports = { sendAppointmentEmail };
