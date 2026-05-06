const Job = require('../models/Job');
const User = require('../models/User');
const aiService = require('../services/aiService');

// GET /api/jobs
exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, type, level, location, search, sort = '-createdAt' } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (level) query.level = level;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) query.$text = { $search: search };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name company avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-embedding');

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name company avatar location')
      .select('-embedding');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    job.views = (job.views || 0) + 1;
    await job.save({ validateBeforeSave: false });

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs
exports.createJob = async (req, res, next) => {
  try {
    const jobData = { ...req.body, postedBy: req.user.id };
    const job = await Job.create(jobData);

    // Generate embedding for semantic search
    try {
      const textForEmbedding = `${job.title} ${job.description} ${(job.skills || []).join(' ')} ${(job.requirements || []).join(' ')}`;
      job.embedding = await aiService.generateEmbedding(textForEmbedding);
      await job.save({ validateBeforeSave: false });
    } catch (e) {
      console.warn('Embedding generation failed:', e.message);
    }

    await User.findByIdAndUpdate(req.user.id, { $push: { postedJobs: job._id } });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs/:id/apply
exports.applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const alreadyApplied = job.applicants.some(a => a.candidate.toString() === req.user.id);
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'Already applied to this job.' });
    }

    let matchScore = 0;
    try {
      const candidate = await User.findById(req.user.id);
      if (candidate.skills?.length && job.embedding?.length) {
        const candidateText = `${candidate.skills.join(' ')} ${candidate.title || ''} ${(candidate.experience || []).map(e => e.title).join(' ')}`;
        const candidateEmbedding = await aiService.generateEmbedding(candidateText);
        const similarity = aiService.cosineSimilarity(candidateEmbedding, job.embedding);
        matchScore = Math.round(similarity * 100);
      }
    } catch (e) {
      console.warn('Match score generation failed:', e.message);
    }

    job.applicants.push({ candidate: req.user.id, matchScore });
    await job.save({ validateBeforeSave: false });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { appliedJobs: job._id } });

    res.json({ success: true, message: 'Application submitted!', matchScore });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id/applicants (recruiter only)
exports.getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.candidate', 'name email title skills profileScore avatar location')
      .select('-embedding');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, data: job.applicants });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/jobs/:jobId/applicants/:candidateId/status
exports.updateApplicantStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const applicant = job.applicants.find(a => a.candidate.toString() === req.params.candidateId);
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found.' });

    applicant.status = status;
    if (notes) applicant.notes = notes;
    await job.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Status updated.', data: applicant });
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs/:id/save
exports.saveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.id;
    const isSaved = user.savedJobs.includes(jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, saved: !isSaved });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/semantic-match (for a candidate)
exports.semanticJobMatch = async (req, res, next) => {
  try {
    const candidate = await User.findById(req.user.id);
    if (!candidate.skills?.length) {
      return res.status(400).json({ success: false, message: 'Please add skills to your profile first.' });
    }

    const candidateText = `${candidate.skills.join(' ')} ${candidate.title || ''} ${(candidate.experience || []).map(e => `${e.title} ${e.company}`).join(' ')}`;
    const candidateEmbedding = await aiService.generateEmbedding(candidateText);

    const jobs = await Job.find({ isActive: true, 'embedding.0': { $exists: true } }).select('-applicants');
    const scored = jobs.map(job => ({
      job: { ...job.toObject(), embedding: undefined },
      score: Math.round(aiService.cosineSimilarity(candidateEmbedding, job.embedding) * 100)
    })).sort((a, b) => b.score - a.score).slice(0, 10);

    res.json({ success: true, data: scored });
  } catch (error) {
    next(error);
  }
};
