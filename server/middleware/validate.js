const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    console.error('Validation Error:', errorMessages, 'Body:', req.body);
    return next(new ApiError(400, errorMessages));
  }
  next();
};

module.exports = validate;
