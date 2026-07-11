const express = require('express');
const { body } = require('express-validator');
const {
  startInterview,
  submitTurn,
  completeInterview,
  getInterview,
  getInterviews,
} = require('../controllers/liveInterview.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.post(
  '/start',
  aiLimiter,
  [
    body('userName', 'Your name is required').notEmpty(),
    body('jobRole', 'Job role is required').notEmpty(),
    body('jobDescription', 'Job description is required').notEmpty(),
  ],
  validate,
  startInterview
);

router.post(
  '/:id/turn',
  aiLimiter,
  [
    body('questionIndex', 'Question index is required').isNumeric(),
    body('userAnswer', 'User answer is required').notEmpty(),
  ],
  validate,
  submitTurn
);

router.post('/:id/complete', completeInterview);

router.get('/', getInterviews);
router.get('/:id', getInterview);

module.exports = router;
