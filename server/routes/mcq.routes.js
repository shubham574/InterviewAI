const express = require('express');
const { body } = require('express-validator');
const {
  generateMCQSet,
  getMCQSets,
  getMCQSet,
  deleteMCQSet,
} = require('../controllers/mcq.controller');
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
      body('count', 'Count is required and must be numeric').isNumeric(),
      body('difficulty', 'Difficulty is required').notEmpty(),
    ],
    validate,
    generateMCQSet
  );

router.route('/').get(getMCQSets);

router
  .route('/:id')
  .get(getMCQSet)
  .delete(deleteMCQSet);

module.exports = router;
