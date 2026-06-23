const express = require('express');
const { body } = require('express-validator');
const {
  analyzeJob,
  getAnalyses,
  getAnalysis,
  deleteAnalysis,
} = require('../controllers/jobAnalysis.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router
  .route('/')
  .post(
    aiLimiter,
    [
      body('jobRole', 'Job role is required').notEmpty(),
      body('jobDescription', 'Job description is required').notEmpty(),
      body('experienceLevel', 'Experience level is required').notEmpty(),
    ],
    validate,
    analyzeJob
  )
  .get(getAnalyses);

router
  .route('/:id')
  .get(getAnalysis)
  .delete(deleteAnalysis);

module.exports = router;
