const express = require('express');
const multer = require('multer');
const { transcribeAudio, generateSpeech } = require('../controllers/transcription.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Store audio in memory (no disk I/O needed — we stream directly to Deepgram)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    // Accept all audio MIME types browsers might send
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are accepted'), false);
    }
  },
});

router.post('/', protect, upload.single('audio'), transcribeAudio);
router.post('/tts', protect, generateSpeech);

module.exports = router;
