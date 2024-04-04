const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const multer = require('../middlewares/multerConfig2')

router.post('/:challengeId/addSubmission',multer, submissionController.addSubmission);
router.get('/:challengeId/submissions', submissionController.getSubmissionsByChallengeId);

module.exports = router;
