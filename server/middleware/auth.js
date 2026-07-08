const { getAuth } = require('@clerk/express');
const ApiError = require('../utils/ApiError');

const protect = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  // Ensure req.auth is populated for controllers
  req.auth = getAuth(req);
  next();
};

module.exports = { protect };
