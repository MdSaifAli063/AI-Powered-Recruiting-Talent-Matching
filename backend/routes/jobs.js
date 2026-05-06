const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', jobController.getJobs);
router.get('/semantic-match', protect, authorize('candidate'), jobController.semanticJobMatch);
router.get('/:id', jobController.getJob);
router.post('/', protect, authorize('recruiter', 'admin'), jobController.createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), jobController.updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), jobController.deleteJob);
router.post('/:id/apply', protect, authorize('candidate'), jobController.applyToJob);
router.post('/:id/save', protect, jobController.saveJob);
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), jobController.getApplicants);
router.patch('/:jobId/applicants/:candidateId/status', protect, authorize('recruiter', 'admin'), jobController.updateApplicantStatus);

module.exports = router;
