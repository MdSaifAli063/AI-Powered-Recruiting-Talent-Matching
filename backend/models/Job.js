const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyLogo: { type: String, default: '' },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    default: 'full-time'
  },
  level: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [{ type: String }],
  responsibilities: [{ type: String }],
  skills: [{ type: String }],
  benefits: [{ type: String }],
  department: { type: String, default: '' },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'],
      default: 'applied'
    },
    matchScore: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  }],
  embedding: [{ type: Number }], // For semantic search
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  deadline: { type: Date },
  views: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
