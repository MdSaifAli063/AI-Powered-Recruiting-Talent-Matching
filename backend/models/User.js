const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['recruiter', 'candidate', 'admin'],
    default: 'candidate'
  },
  avatar: { type: String, default: '' },
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },

  // Candidate-specific
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  resumeUrl: { type: String, default: '' },
  resumeText: { type: String, default: '' },
  profileScore: { type: Number, default: 0, min: 0, max: 100 },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Recruiter-specific
  shortlistedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
