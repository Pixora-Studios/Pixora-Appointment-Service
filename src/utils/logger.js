const REDACTED_KEYS = [
  process.env.MASTER_ADMIN_KEY,
  process.env.BREVO_API_KEY,
  process.env.RESEND_API_KEY,
  process.env.HOSTINGER_SMTP_PASS,
].filter(Boolean);

/**
 * Redacts sensitive keys from a string.
 */
const redact = (message) => {
  if (typeof message !== 'string') return message;

  let redactedMessage = message;
  REDACTED_KEYS.forEach(key => {
    if (key && key.length > 3) {
      // Escape special characters in key for regex
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedKey, 'g');
      redactedMessage = redactedMessage.replace(regex, '[REDACTED]');
    }
  });

  // Also redact anything that looks like our clinic API key pattern
  redactedMessage = redactedMessage.replace(/pix_live_[a-f0-9]{32,}/g, 'pix_live_[REDACTED]');

  return redactedMessage;
};

const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${redact(message)}`);
  },
  error: (message) => {
    if (message instanceof Error) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${redact(message.stack)}`);
    } else {
      console.error(`[ERROR] ${new Date().toISOString()}: ${redact(message)}`);
    }
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${redact(message)}`);
  },
  redact // export for manual use if needed
};

module.exports = logger;
