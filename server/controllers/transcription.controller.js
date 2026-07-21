const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Transcribe audio using Deepgram REST API
// @route   POST /api/transcribe
// @access  Private
exports.transcribeAudio = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'No audio file provided'));
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return next(new ApiError(500, 'Transcription service not configured'));
  }

  try {
    // Call Deepgram REST API directly — avoids SDK version issues
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&smart_format=true&punctuate=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': req.file.mimetype,
        },
        body: req.file.buffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram API error:', response.status, errText);
      return next(new ApiError(502, 'Transcription service returned an error'));
    }

    const data = await response.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    res.status(200).json({ success: true, transcript });
  } catch (err) {
    console.error('Deepgram transcription failed:', err.message);
    return next(new ApiError(502, 'Failed to transcribe audio'));
  }
});

// @desc    Generate speech using Deepgram TTS
// @route   POST /api/transcribe/tts
// @access  Private
exports.generateSpeech = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    return next(new ApiError(400, 'No text provided'));
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return next(new ApiError(500, 'TTS service not configured'));
  }

  try {
    // We use aura-asteria-en as it's a clear female voice.
    const response = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram TTS error:', response.status, errText);
      return next(new ApiError(502, 'TTS service returned an error'));
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('Deepgram TTS failed:', err.message);
    return next(new ApiError(502, 'Failed to generate speech'));
  }
});
