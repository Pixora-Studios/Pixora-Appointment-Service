const nodemailer = require('nodemailer');
const { generateAppointmentEmail } = require('../templates/appointmentNotification');

const sendAppointmentEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateAppointmentEmail(data);

  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_SMTP_HOST,
    port: process.env.GMAIL_SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Nodemailer Error: ${error.message}`);
  }
};

module.exports = { sendAppointmentEmail };
