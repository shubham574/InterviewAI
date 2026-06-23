const { generateStudyMaterial } = require('../services/studyGen.service');

// @desc    Generate study material for a topic
// @route   POST /api/study/generate
// @access  Private
exports.generateMaterial = async (req, res) => {
  try {
    const { topic, jobRole } = req.body;

    if (!topic || !jobRole) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both topic and jobRole'
      });
    }

    const material = await generateStudyMaterial(topic, jobRole);

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (err) {
    console.error('Study Material Generation Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};
