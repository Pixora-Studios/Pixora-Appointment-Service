const Clinic = require('../models/Clinic');
const { hashKey } = require('../utils/apiKeyService');

const clinicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing Clinic API Key',
    });
  }

  const apiKey = authHeader.split(' ')[1];
  const hashedKey = hashKey(apiKey);

  try {
    const clinic = await Clinic.findOne({ keyHash: hashedKey, isActive: true });

    if (!clinic) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or inactive Clinic API Key',
      });
    }

    // Attach clinic to request for use in controllers
    req.clinic = clinic;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

module.exports = clinicAuth;
