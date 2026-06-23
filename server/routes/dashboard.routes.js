const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, getStats);

module.exports = router;
