const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      title: user.title,
      company: user.company,
      profileScore: user.profileScore
    }
  });
};

// POST /api/auth/register
exports.register = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['recruiter', 'candidate']).withMessage('Role must be recruiter or candidate'),
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role, company } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
      const user = await User.create({ name, email, password, role, company: company || '' });
      sendAuthResponse(res, user, 201);
    } catch (error) {
      next(error);
    }
  }
];

// POST /api/auth/login
exports.login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      sendAuthResponse(res, user);
    } catch (error) {
      next(error);
    }
  }
];

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedJobs', 'title company location type')
      .populate('appliedJobs', 'title company location type');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'title', 'bio', 'location', 'phone', 'website', 'linkedin', 'github', 'company', 'skills', 'experience', 'education'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ success: false, message: 'No avatar data provided.' });
    
    const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
    res.json({ success: true, user: { id: user._id, avatar: user.avatar } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};
