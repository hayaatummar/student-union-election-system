const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { castVote, getMyVotes, checkVoteStatus, getElectionVotes } = require('../controllers/voteController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', authenticate, [
  body('electionId').notEmpty().withMessage('Election ID is required'),
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  body('positionId').notEmpty().withMessage('Position ID is required'),
  validate,
], castVote);

router.get('/my-votes', authenticate, getMyVotes);
router.get('/check/:electionId', authenticate, checkVoteStatus);
router.get('/election/:electionId', authenticate, authorize('ADMIN'), getElectionVotes);

module.exports = router;
