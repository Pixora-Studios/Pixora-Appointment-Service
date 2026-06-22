const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const apiKeyService = require('../services/apiKeyService');
const { validationResult } = require('express-validator');

exports.createClinic = async (req, res, next) => {
  try {
    const { clinicName, doctorName, clinicEmail, phone } = req.body;

    const apiKey = apiKeyService.generateKey();
    const keyHash = apiKeyService.hashKey(apiKey);
    const keyPrefix = apiKeyService.getKeyPrefix(apiKey);

    const clinic = await Clinic.create({
      clinicName,
      doctorName,
      clinicEmail,
      phone,
      keyHash,
      keyPrefix,
    });

    res.status(201).json({
      success: true,
      clinicId: clinic._id,
      apiKey,
      message: 'Store this key now — it will not be shown again.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllClinics = async (req, res, next) => {
  try {
    const clinics = await Clinic.find().select('-keyHash');
    res.json({ success: true, clinics });
  } catch (error) {
    next(error);
  }
};

exports.regenerateKey = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    const apiKey = apiKeyService.generateKey();
    clinic.keyHash = apiKeyService.hashKey(apiKey);
    clinic.keyPrefix = apiKeyService.getKeyPrefix(apiKey);
    await clinic.save();

    res.json({
      success: true,
      apiKey,
      message: 'New API key generated. Store it now — it will not be shown again.',
    });
  } catch (error) {
    next(error);
  }
};

exports.disableClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    res.json({ success: true, message: 'Clinic disabled' });
  } catch (error) {
    next(error);
  }
};

exports.enableClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    res.json({ success: true, message: 'Clinic enabled' });
  } catch (error) {
    next(error);
  }
};

exports.getAdminAppointments = async (req, res, next) => {
  try {
    const { clinicId, status, from, to, emailSent } = req.query;
    const filter = {};

    if (clinicId) filter.clinicId = clinicId;
    if (status) filter.status = status;
    if (emailSent) filter.emailSent = emailSent === 'true';

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const appointments = await Appointment.find(filter).populate('clinicId', 'clinicName');
    res.json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
};
