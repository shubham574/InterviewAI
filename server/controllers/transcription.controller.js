const { createClient } = require('@deepgram/sdk');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Transcribe audio using Deepgram
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

  const deepgram = createClient(apiKey);

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      req.file.buffer,
      {
        model: 'nova-2',        // Best accuracy model
        language: 'en-IN',      // Indian English
        smart_format: true,     // Auto punctuation & formatting
        punctuate: true,
        diarize: false,
      }
    );

    if (error) {
      console.error('Deepgram error:', error);
      return next(new ApiError(502, 'Transcription service error'));
    }

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    res.status(200).json({
      success: true,
      transcript,
    });
  } catch (err) {
    console.error('Deepgram transcription failed:', err.message);
    return next(new ApiError(502, 'Failed to transcribe audio'));
  }
});
