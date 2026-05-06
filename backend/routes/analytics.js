const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recruiter', protect, authorize('recruiter', 'admin'), analyticsController.getRecruiterAnalytics);
router.get('/candidate', protect, authorize('candidate'), analyticsController.getCandidateAnalytics);

module.exports = router;
