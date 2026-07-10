const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const pdfParse = require('pdf-parse');
const { analyzeResume } = require('../services/resumeAnalysis.service');

// @desc    Analyze resume against JD
// @route   POST /api/resume/analyze
// @access  Private
exports.analyzeResumeMatch = asyncHandler(async (req, res, next) => {
  const { jobDescription } = req.body;
  const file = req.file;

  if (!file) {
    return next(new ApiError(400, 'Please upload a resume PDF file'));
  }

  if (!jobDescription) {
    return next(new ApiError(400, 'Please provide a job description'));
  }

  try {
    // Parse PDF text from memory buffer
    const pdfData = await pdfParse(file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim() === '') {
      return next(new ApiError(400, 'Could not extract text from the PDF file'));
    }

    // Call AI Service
    const customApiKey = req.headers['x-gemini-api-key'];
    const aiResult = await analyzeResume(resumeText, jobDescription, customApiKey);

    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return next(new ApiError(500, 'Error parsing PDF or generating analysis'));
  }
});
