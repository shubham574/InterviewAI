const express = require('express');
const multer = require('multer');
const { transcribeAudio, generateSpeech } = require('../controllers/transcription.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Store audio in memory (no disk I/O needed — processed directly with Google Gemini)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    // Accept audio MIME types and browser WebM/media containers
    const mtype = (file.mimetype || '').toLowerCase();
    const isAudio =
      mtype.startsWith('audio/') ||
      mtype.startsWith('video/') ||
      mtype.includes('webm') ||
      mtype === 'application/octet-stream' ||
      mtype === 'binary/octet-stream' ||
      /\.(webm|ogg|wav|mp3|m4a|mp4|aac)$/i.test(file.originalname || '');

    if (isAudio) {
      cb(null, true);
    } else {
      console.warn(`Rejected file upload with mimetype: ${file.mimetype}, name: ${file.originalname}`);
      cb(new Error(`Unsupported audio format (${file.mimetype}). Please upload an audio file.`), false);
    }
  },
});

router.post('/', protect, upload.single('audio'), transcribeAudio);
router.post('/tts', generateSpeech);

module.exports = router;
