const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const multer = require('../middlewares/multerConfig3')

router.post('/:challengeId/addSubmission',multer, submissionController.addSubmission);
router.get('/get/:id', submissionController.getSubmissionById);
router.post('/editSubmission/:id',multer, submissionController.editSubmission);
router.get('/:challengeId/submissions', submissionController.getSubmissionsByChallengeId);
router.post('/updateSubmissionScore/:id',multer, submissionController.updateSubmissionScore);

router.get('/get/all/submission', submissionController.getListChallengeChallenger);
router.delete('/delete/:id', submissionController.DeleteSubmission);
router.get('/AllSubmissions',submissionController.AllSubmissions);
router.get('/SubmissionsByIdChallenge/:id',submissionController.SubmissionsByIdChallenge);
router.get('/SubmissionsDetails/:id', submissionController.SubmissionsDetails);
module.exports = router;
