const { Resend } = require('resend');
const { generateAppointmentEmail } = require('../templates/appointmentNotification');
const { generateTableBookingEmail } = require('../templates/tableBookingNotification');

const sendAppointmentEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateAppointmentEmail(data);

  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key is missing');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(`Resend Error: ${error.message}`);
  }
};

const sendTableBookingEmail = async (data) => {
  const { to } = data;
  const { subject, html, text } = generateTableBookingEmail(data);

  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key is missing');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(`Resend Error: ${error.message}`);
  }
};

module.exports = {
  sendAppointmentEmail,
  sendTableBookingEmail,
};
