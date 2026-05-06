const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, authorize('candidate'), upload.single('resume'), resumeController.uploadResume);
router.post('/analyze', protect, authorize('candidate'), resumeController.analyzeResume);
router.get('/me', protect, resumeController.getMyResume);
router.post('/skill-gap', protect, authorize('candidate'), resumeController.analyzeSkillGap);
router.post('/match-job', protect, authorize('candidate'), resumeController.matchJob);

module.exports = router;
