const { getAuth } = require('@clerk/express');
const ApiError = require('../utils/ApiError');

const protect = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  // Forcefully attach it as a plain object to avoid any getter/proxy issues
  req.auth = { userId };
  next();
};

module.exports = { protect };
