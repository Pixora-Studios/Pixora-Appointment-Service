const EmailProvider = require('../models/EmailProvider');
const emailService = require('../services/email/emailService');

exports.getProviders = async (req, res, next) => {
  try {
    const providers = await EmailProvider.find().sort({ priority: 1 });
    res.json({ success: true, providers });
  } catch (error) {
    next(error);
  }
};

exports.toggleProvider = async (req, res, next) => {
  try {
    const { providerName } = req.params;
    const { isActive } = req.body;

    const provider = await EmailProvider.findOneAndUpdate(
      { providerName },
      { isActive },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

exports.updatePriority = async (req, res, next) => {
  try {
    const { providerName } = req.params;
    const { priority } = req.body;

    const provider = await EmailProvider.findOneAndUpdate(
      { providerName },
      { priority },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

exports.testProvider = async (req, res, next) => {
  try {
    const { providerName } = req.params;
    const { testRecipientEmail } = req.body;

    if (!testRecipientEmail) {
      return res.status(400).json({ success: false, message: 'testRecipientEmail is required' });
    }

    const result = await emailService.sendTestEmail(providerName, testRecipientEmail);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetCounters = async (req, res, next) => {
  try {
    await EmailProvider.updateMany({}, { sentToday: 0, lastResetDate: new Date().toISOString().split('T')[0] });
    res.json({ success: true, message: 'Counters reset successfully' });
  } catch (error) {
    next(error);
  }
};
