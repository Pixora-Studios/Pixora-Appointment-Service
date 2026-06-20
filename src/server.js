require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const EmailProvider = require('./models/EmailProvider');
const logger = require('./utils/logger');
const { EMAIL_PROVIDERS } = require('./config/constants');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Seed Email Providers
const seedProviders = async () => {
  try {
    const providers = [
      {
        providerName: EMAIL_PROVIDERS.BREVO,
        isActive: true,
        priority: 1,
        dailyLimit: 300,
      },
      {
        providerName: EMAIL_PROVIDERS.RESEND,
        isActive: true,
        priority: 2,
        dailyLimit: 100,
      },
      {
        providerName: EMAIL_PROVIDERS.HOSTINGER_SMTP,
        isActive: true,
        priority: 3,
        dailyLimit: 100, // Hostinger free email limit
      },
    ];

    for (const provider of providers) {
      await EmailProvider.findOneAndUpdate(
        { providerName: provider.providerName },
        { $setOnInsert: provider },
        { upsert: true, new: true }
      );
    }
    logger.info('Email providers seeded/verified');
  } catch (error) {
    logger.error(`Seeding error: ${error.message}`);
  }
};

seedProviders();

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
