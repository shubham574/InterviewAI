const { getAuth } = require('@clerk/express');
const ApiError = require('../utils/ApiError');

const protect = (req, res, next) => {
  req.auth = { userId: "test-user-123" };
  next();
};

module.exports = { protect };
