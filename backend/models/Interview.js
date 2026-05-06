const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  jobTitle: { type: String, default: 'General Technical Interview' },
  targetRole: { type: String },
  
  messages: [{
    role: { type: String, enum: ['system', 'assistant', 'user'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    questionType: { type: String, enum: ['technical', 'behavioral', 'situational', 'followup'] },
    score: { type: Number, min: 0, max: 10 }
  }],

  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },

  report: {
    technicalScore: { type: Number, min: 0, max: 100 },
    communicationScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    strengths: [String],
    weaknesses: [String],
    recommendation: { type: String, enum: ['strong-hire', 'hire', 'maybe', 'no-hire'] },
    summary: String,
    detailedFeedback: String
  },

  duration: { type: Number }, // minutes
  questionsAsked: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
