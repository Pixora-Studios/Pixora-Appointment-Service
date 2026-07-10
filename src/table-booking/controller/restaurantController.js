const Restaurant = require('../model/Restaurant');
const apiKeyService = require('../../utils/apiKeyService');

exports.createRestaurant = async (req, res, next) => {
  try {
    const { restaurantName, contactName, restaurantEmail, phone } = req.body;

    if (!restaurantName || !contactName || !restaurantEmail || !phone) {
      return res.status(400).json({
        success: false,
        message: 'restaurantName, contactName, restaurantEmail, and phone are required',
      });
    }

    const apiKey = apiKeyService.generateKey();
    const keyHash = apiKeyService.hashKey(apiKey);
    const keyPrefix = apiKeyService.getKeyPrefix(apiKey);

    const restaurant = await Restaurant.create({
      restaurantName,
      contactName,
      restaurantEmail,
      phone,
      keyHash,
      keyPrefix,
    });

    res.status(201).json({
      success: true,
      restaurantId: restaurant._id,
      apiKey,
      message: 'Store this key now — it will not be shown again.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().select('-keyHash');
    res.json({ success: true, restaurants });
  } catch (error) {
    next(error);
  }
};

exports.regenerateKey = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const apiKey = apiKeyService.generateKey();
    restaurant.keyHash = apiKeyService.hashKey(apiKey);
    restaurant.keyPrefix = apiKeyService.getKeyPrefix(apiKey);
    await restaurant.save();

    res.json({
      success: true,
      apiKey,
      message: 'New API key generated. Store it now — it will not be shown again.',
    });
  } catch (error) {
    next(error);
  }
};

exports.disableRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, message: 'Restaurant disabled' });
  } catch (error) {
    next(error);
  }
};

exports.enableRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, message: 'Restaurant enabled' });
  } catch (error) {
    next(error);
  }
};
