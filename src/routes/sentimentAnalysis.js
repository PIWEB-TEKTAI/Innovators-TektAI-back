const sentimentAnalysis = require('../controllers/sentimentAnalysis');
const express = require("express")
const router = express.Router();

router.get('/get',sentimentAnalysis.analysisSentimentDiscussion);

router.get('/:id',sentimentAnalysis.analysisSentimentDiscussionByChallenge);

module.exports = router