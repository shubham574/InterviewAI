const express = require('express');
const { body } = require('express-validator');
const {
  submitAssessment,
  getAssessments,
  getAssessment,
} = require('../controllers/assessment.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    [
      body('mcqSetId', 'MCQ Set ID is required').notEmpty(),
      body('answers', 'Answers array is required').isArray(),
      body('timeTaken', 'Time taken is required').isNumeric(),
    ],
    validate,
    submitAssessment
  )
  .get(getAssessments);

router.route('/:id').get(getAssessment);

module.exports = router;
