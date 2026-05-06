const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/candidates - list all candidates (recruiter)
router.get('/', protect, authorize('recruiter', 'admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 12, skills, minScore, search } = req.query;
    const query = { role: 'candidate', isActive: true };

    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr };
    }
    if (minScore) query.profileScore = { $gte: Number(minScore) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await User.countDocuments(query);
    const candidates = await User.find(query)
      .select('name email title skills profileScore avatar location bio company createdAt')
      .sort('-profileScore')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: candidates,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) { next(error); }
});

// GET /api/candidates/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'candidate' })
      .select('-password')
      .populate('appliedJobs', 'title company');
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });
    res.json({ success: true, data: candidate });
  } catch (error) { next(error); }
});

// POST /api/candidates/:id/shortlist
router.post('/:id/shortlist', protect, authorize('recruiter', 'admin'), async (req, res, next) => {
  try {
    const recruiter = await User.findById(req.user.id);
    const isShortlisted = recruiter.shortlistedCandidates.includes(req.params.id);
    if (isShortlisted) {
      recruiter.shortlistedCandidates = recruiter.shortlistedCandidates.filter(id => id.toString() !== req.params.id);
    } else {
      recruiter.shortlistedCandidates.push(req.params.id);
    }
    await recruiter.save({ validateBeforeSave: false });
    res.json({ success: true, shortlisted: !isShortlisted });
  } catch (error) { next(error); }
});

// GET /api/candidates/shortlisted
router.get('/me/shortlisted', protect, authorize('recruiter', 'admin'), async (req, res, next) => {
  try {
    const recruiter = await User.findById(req.user.id)
      .populate('shortlistedCandidates', 'name email title skills profileScore avatar location');
    res.json({ success: true, data: recruiter.shortlistedCandidates });
  } catch (error) { next(error); }
});

module.exports = router;
