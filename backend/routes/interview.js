const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/start', protect, interviewController.startInterview);
router.get('/my', protect, interviewController.getMyInterviews);
router.get('/:id', protect, interviewController.getInterview);
router.post('/:id/respond', protect, interviewController.respondToInterview);
router.post('/:id/abandon', protect, interviewController.abandonInterview);

module.exports = router;
