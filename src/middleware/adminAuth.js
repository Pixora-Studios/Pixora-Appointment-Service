const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.MASTER_ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing Master Admin Key',
    });
  }

  next();
};

module.exports = adminAuth;
