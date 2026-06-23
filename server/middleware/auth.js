const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route, no token'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Set user on request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ApiError(401, 'User no longer exists'));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, token failed'));
  }
});

module.exports = { protect };
