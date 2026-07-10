const Clinic = require('../models/Clinic');
const Restaurant = require('../table-booking/model/Restaurant');
const { hashKey } = require('../utils/apiKeyService');

const clinicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing API Key',
    });
  }

  const apiKey = authHeader.split(' ')[1];
  const hashedKey = hashKey(apiKey);

  try {
    // 1. Try Clinic look up
    const clinic = await Clinic.findOne({ keyHash: hashedKey, isActive: true });
    if (clinic) {
      req.clinic = clinic;
      req.merchantType = 'clinic';
      return next();
    }

    // 2. Try Restaurant look up
    const restaurant = await Restaurant.findOne({ keyHash: hashedKey, isActive: true });
    if (restaurant) {
      // Create a compatible clinic alias so existing appointment booking / emails work seamlessly
      const aliasClinic = {
        _id: restaurant._id,
        clinicName: restaurant.restaurantName,
        doctorName: restaurant.contactName,
        clinicEmail: restaurant.restaurantEmail,
        phone: restaurant.phone,
        isActive: restaurant.isActive,
        createdAt: restaurant.createdAt,
      };

      req.clinic = aliasClinic;
      req.restaurant = restaurant;
      req.merchantType = 'restaurant';
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or inactive API Key',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

module.exports = clinicAuth;
