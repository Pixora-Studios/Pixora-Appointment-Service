const nodemailer = require('nodemailer');
const { generateAppointmentEmail } = require('../templates/appointmentNotification');
const { generateTableBookingEmail } = require('../templates/tableBookingNotification');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.HOSTINGER_SMTP_HOST,
    port: parseInt(process.env.HOSTINGER_SMTP_PORT) || 465,
    secure: process.env.HOSTINGER_SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.HOSTINGER_SMTP_USER,
      pass: process.env.HOSTINGER_SMTP_PASS,
    },
  });
};

/**
 * Hostinger/Titan Mail SMTP Provider
 * Configuration values are read from environment variables.
 */
const sendAppointmentEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateAppointmentEmail(data);

  const transporter = createTransporter();

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
    throw new Error(`Hostinger SMTP Error: ${error.message}`);
  }
};

const sendTableBookingEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateTableBookingEmail(data);

  const transporter = createTransporter();

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
    throw new Error(`Hostinger SMTP Error: ${error.message}`);
  }
};

module.exports = {
  sendAppointmentEmail,
  sendTableBookingEmail,
};
