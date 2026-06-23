const express = require('express');
const { body } = require('express-validator');
const {
  generateQuestions,
  getQuestionSets,
  getQuestionSet,
  deleteQuestionSet,
} = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router
  .route('/generate')
  .post(
    aiLimiter,
    [
      body('jobRole', 'Job role is required').notEmpty(),
      body('skills', 'Skills array is required').isArray(),
      body('category', 'Category is required').notEmpty(),
    ],
    validate,
    generateQuestions
  );

router.route('/').get(getQuestionSets);

router
  .route('/:id')
  .get(getQuestionSet)
  .delete(deleteQuestionSet);

module.exports = router;
