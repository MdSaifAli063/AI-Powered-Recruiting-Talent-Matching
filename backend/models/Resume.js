const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: { type: String },
  fileUrl: { type: String },
  rawText: { type: String },
  
  // AI-extracted structured data
  parsedData: {
    name: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    skills: [String],
    technicalSkills: [String],
    softSkills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
      highlights: [String]
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
      gpa: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      complexity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    certifications: [String],
    languages: [String],
    totalExperience: Number // in years
  },

  // AI Scoring
  scores: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    skillDepth: { type: Number, default: 0, min: 0, max: 100 },
    projectComplexity: { type: Number, default: 0, min: 0, max: 100 },
    careerGrowth: { type: Number, default: 0, min: 0, max: 100 },
    communicationClarity: { type: Number, default: 0, min: 0, max: 100 },
    educationRelevance: { type: Number, default: 0, min: 0, max: 100 }
  },

  // AI Feedback
  feedback: {
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    improvements: [String],
    summary: String
  },

  embedding: [{ type: Number }], // For semantic matching
  isAnalyzed: { type: Boolean, default: false },
  analyzedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
