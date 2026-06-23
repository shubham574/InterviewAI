const express = require('express');
const { getHistory, deleteHistoryItem } = require('../controllers/history.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getHistory);
router.delete('/:type/:id', deleteHistoryItem);

module.exports = router;
