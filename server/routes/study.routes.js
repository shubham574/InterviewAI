const express = require('express');
const router = express.Router();
const { generateMaterial } = require('../controllers/study.controller');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateMaterial);

module.exports = router;
