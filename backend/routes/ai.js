const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/bias-detect', protect, aiController.detectBias);
router.post('/outreach', protect, authorize('recruiter', 'admin'), aiController.generateOutreach);
router.post('/skill-gap', protect, aiController.skillGap);

module.exports = router;
