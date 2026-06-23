const express = require('express');
const { body } = require('express-validator');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getInterviews,
} = require('../controllers/mockInterview.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.post(
  '/start',
  aiLimiter,
  [
    body('jobRole', 'Job role is required').notEmpty(),
  ],
  validate,
  startInterview
);

router.post(
  '/:id/answer',
  aiLimiter,
  [
    body('questionIndex', 'Question index is required').isNumeric(),
    body('userAnswer', 'User answer is required').notEmpty(),
  ],
  validate,
  submitAnswer
);

router.post('/:id/complete', completeInterview);

router.get('/', getInterviews);
router.get('/:id', getInterview);

module.exports = router;
