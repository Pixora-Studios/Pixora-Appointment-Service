const crypto = require('crypto');
const { API_KEY_PREFIX } = require('../config/constants');

/**
 * Generates a new random API key.
 * Format: pix_live_<32 random hex chars>
 */
const generateKey = () => {
  const randomChars = crypto.randomBytes(24).toString('hex');
  return `${API_KEY_PREFIX}${randomChars}`;
};

/**
 * Hashes a given API key using SHA-256.
 */
const hashKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Extracts the non-secret prefix from the API key (first 12 chars).
 */
const getKeyPrefix = (key) => {
  return key.substring(0, 12);
};

module.exports = {
  generateKey,
  hashKey,
  getKeyPrefix,
};
