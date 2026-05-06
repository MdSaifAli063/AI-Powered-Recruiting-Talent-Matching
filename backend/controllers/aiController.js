const aiService = require('../services/aiService');
const User = require('../models/User');

// POST /api/ai/bias-detect
exports.detectBias = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription?.trim()) {
      return res.status(400).json({ success: false, message: 'jobDescription is required.' });
    }
    const result = await aiService.detectBias(jobDescription);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/outreach
exports.generateOutreach = async (req, res, next) => {
  try {
    const { candidateId, jobTitle, tone = 'professional' } = req.body;
    if (!candidateId || !jobTitle) {
      return res.status(400).json({ success: false, message: 'candidateId and jobTitle are required.' });
    }

    const candidate = await User.findById(candidateId).select('name skills title');
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });

    const recruiter = await User.findById(req.user.id).select('name company');

    const result = await aiService.generateOutreach(
      recruiter.name,
      recruiter.company || 'our company',
      candidate,
      jobTitle,
      tone
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/skill-gap
exports.skillGap = async (req, res, next) => {
  try {
    const { skills, jobDescription, jobTitle } = req.body;
    if (!jobDescription || !jobTitle) {
      return res.status(400).json({ success: false, message: 'jobDescription and jobTitle are required.' });
    }
    const candidateSkills = skills?.length ? skills : (req.user.skills || []);
    if (!candidateSkills.length) {
      return res.status(400).json({ success: false, message: 'No skills provided.' });
    }
    const result = await aiService.analyzeSkillGap(candidateSkills, jobDescription, jobTitle);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
