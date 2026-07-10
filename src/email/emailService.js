const EmailProvider = require('../models/EmailProvider');
const nodemailerProvider = require('../providers/nodemailerProvider');
const resendProvider = require('../providers/resendProvider');
const brevoProvider = require('../providers/brevoProvider');
const logger = require('../utils/logger');
const { EMAIL_PROVIDERS } = require('../config/constants');

const providers = {
  [EMAIL_PROVIDERS.HOSTINGER_SMTP]: nodemailerProvider,
  [EMAIL_PROVIDERS.RESEND]: resendProvider,
  [EMAIL_PROVIDERS.BREVO]: brevoProvider,
};

const resetDailyCounters = async () => {
  const today = new Date().toISOString().split('T')[0];
  await EmailProvider.updateMany(
    { lastResetDate: { $ne: today } },
    { sentToday: 0, lastResetDate: today }
  );
};

const sendAppointmentEmail = async (appointmentData, clinicEmail) => {
  // Ensure counters are up to date
  await resetDailyCounters();

  // Get active providers sorted by priority
  const activeProviders = await EmailProvider.find({ isActive: true }).sort({ priority: 1 });

  let lastError = null;

  for (const providerDoc of activeProviders) {
    // Check if daily limit reached
    if (providerDoc.sentToday >= providerDoc.dailyLimit) {
      logger.warn(`Provider ${providerDoc.providerName} reached its daily limit.`);
      continue;
    }

    const providerModule = providers[providerDoc.providerName];
    if (!providerModule) {
      logger.error(`No module found for provider: ${providerDoc.providerName}`);
      continue;
    }

    try {
      await providerModule.sendAppointmentEmail({
        ...appointmentData,
        to: clinicEmail,
      });

      // Update provider stats on success
      providerDoc.sentToday += 1;
      providerDoc.lastUsedAt = new Date();
      await providerDoc.save();

      return {
        success: true,
        providerUsed: providerDoc.providerName,
      };
    } catch (error) {
      lastError = error.message;
      logger.error(`Error sending via ${providerDoc.providerName}: ${lastError}`);

      // Update provider stats on failure
      providerDoc.lastError = lastError;
      providerDoc.lastErrorAt = new Date();
      await providerDoc.save();

      // Continue to next provider in the fallback chain
    }
  }

  // If we reach here, all providers failed or were exhausted
  return {
    success: false,
    error: lastError || 'All active email providers are exhausted or failed.',
  };
};

const sendTableBookingEmail = async (bookingData, clinicEmail) => {
  // Ensure counters are up to date
  await resetDailyCounters();

  // Get active providers sorted by priority
  const activeProviders = await EmailProvider.find({ isActive: true }).sort({ priority: 1 });

  let lastError = null;

  for (const providerDoc of activeProviders) {
    // Check if daily limit reached
    if (providerDoc.sentToday >= providerDoc.dailyLimit) {
      logger.warn(`Provider ${providerDoc.providerName} reached its daily limit.`);
      continue;
    }

    const providerModule = providers[providerDoc.providerName];
    if (!providerModule) {
      logger.error(`No module found for provider: ${providerDoc.providerName}`);
      continue;
    }

    try {
      await providerModule.sendTableBookingEmail({
        ...bookingData,
        to: clinicEmail,
      });

      // Update provider stats on success
      providerDoc.sentToday += 1;
      providerDoc.lastUsedAt = new Date();
      await providerDoc.save();

      return {
        success: true,
        providerUsed: providerDoc.providerName,
      };
    } catch (error) {
      lastError = error.message;
      logger.error(`Error sending via ${providerDoc.providerName}: ${lastError}`);

      // Update provider stats on failure
      providerDoc.lastError = lastError;
      providerDoc.lastErrorAt = new Date();
      await providerDoc.save();

      // Continue to next provider in the fallback chain
    }
  }

  // If we reach here, all providers failed or were exhausted
  return {
    success: false,
    error: lastError || 'All active email providers are exhausted or failed.',
  };
};

/**
 * Sends a test email through a specific provider, bypassing the fallback chain.
 */
const sendTestEmail = async (providerName, testRecipientEmail) => {
  const providerModule = providers[providerName];
  if (!providerModule) {
    throw new Error(`No module found for provider: ${providerName}`);
  }

  // Dummy appointment data for testing
  const testData = {
    to: testRecipientEmail,
    clinicName: 'Test Clinic',
    patientName: 'Test Patient',
    patientPhone: '1234567890',
    patientEmail: 'test@example.com',
    preferredDate: new Date(),
    preferredTime: '10:00 AM',
    treatmentRequired: 'Test Treatment',
    additionalNotes: 'This is a test email.',
    createdAt: new Date()
  };

  return await providerModule.sendAppointmentEmail(testData);
};

module.exports = {
  sendAppointmentEmail,
  sendTableBookingEmail,
  sendTestEmail,
  resetDailyCounters
};
