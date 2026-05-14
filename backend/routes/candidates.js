const express = require('express');
const router = express.Router();
const {
  getCandidates, getCandidateById, applyForElection,
  updateCandidateStatus, updateCandidateProfile, getMyCandidateProfile,
} = require('../controllers/candidateController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, getCandidates);
router.get('/me', authenticate, getMyCandidateProfile);
router.get('/:id', authenticate, getCandidateById);

router.post('/apply', authenticate, upload.single('campaignPoster'), applyForElection);
router.put('/profile/update', authenticate, upload.single('campaignPoster'), updateCandidateProfile);
router.put('/:id/status', authenticate, authorize('ADMIN'), updateCandidateStatus);

module.exports = router;
