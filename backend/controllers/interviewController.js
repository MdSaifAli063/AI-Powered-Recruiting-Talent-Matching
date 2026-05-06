const Interview = require('../models/Interview');
const User = require('../models/User');
const aiService = require('../services/aiService');

// POST /api/interview/start
exports.startInterview = async (req, res, next) => {
  try {
    const { jobTitle, jobId, targetRole } = req.body;
    const title = jobTitle || targetRole || 'Software Engineer';

    const interview = await Interview.create({
      candidate: req.user.id,
      job: jobId || undefined,
      jobTitle: title,
      targetRole: title,
      messages: [],
      status: 'in-progress'
    });

    // Generate opening message
    const user = await User.findById(req.user.id);
    const candidateContext = user.skills?.length
      ? `Background in ${user.skills.slice(0, 5).join(', ')}`
      : '';

    const openingMessage = await aiService.generateInterviewQuestion([], title, candidateContext);

    interview.messages.push({
      role: 'assistant',
      content: openingMessage,
      questionType: 'behavioral'
    });
    await interview.save();

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview._id,
        message: openingMessage,
        jobTitle: title
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/interview/:id/respond
exports.respondToInterview = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const interview = await Interview.findOne({ _id: req.params.id, candidate: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    if (interview.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Interview is already completed.' });
    }

    // Add candidate message
    interview.messages.push({ role: 'user', content: message, timestamp: new Date() });
    interview.questionsAsked = (interview.questionsAsked || 0) + 1;

    // Generate AI response
    const user = await User.findById(req.user.id);
    const candidateContext = user.skills?.length ? `Background: ${user.skills.slice(0, 5).join(', ')}` : '';

    const aiResponse = await aiService.generateInterviewQuestion(
      interview.messages,
      interview.jobTitle,
      candidateContext
    );

    const isComplete = aiResponse.includes('INTERVIEW_COMPLETE') || interview.questionsAsked >= 8;

    interview.messages.push({
      role: 'assistant',
      content: aiResponse.replace('INTERVIEW_COMPLETE', '').trim(),
      timestamp: new Date()
    });

    if (isComplete) {
      interview.status = 'completed';
      interview.completedAt = new Date();

      // Generate final report
      try {
        const report = await aiService.generateInterviewReport(interview.messages, interview.jobTitle);
        interview.report = report;
      } catch (e) {
        console.warn('Report generation failed:', e.message);
      }
    }

    await interview.save();

    res.json({
      success: true,
      data: {
        message: aiResponse.replace('INTERVIEW_COMPLETE', '').trim(),
        isComplete,
        questionsAsked: interview.questionsAsked,
        report: isComplete ? interview.report : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/interview/:id
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, candidate: req.user.id })
      .populate('job', 'title company');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

// GET /api/interview/my
exports.getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ candidate: req.user.id })
      .populate('job', 'title company')
      .select('-messages')
      .sort('-createdAt');
    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// POST /api/interview/:id/abandon
exports.abandonInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, candidate: req.user.id },
      { status: 'abandoned' },
      { new: true }
    );
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    res.json({ success: true, message: 'Interview abandoned.' });
  } catch (error) {
    next(error);
  }
};
