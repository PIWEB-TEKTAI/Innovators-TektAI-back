const Sentiment = require('sentiment');
const Discussion = require('../models/discussion');



exports.analysisSentimentDiscussionByChallenge = async (req, res) => {
    try {

        const challengeId = req.params.id;

        const sentiment = new Sentiment();
        const discussions = await Discussion.find({ challengeId:challengeId });

        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        let totalScore = 0;

        discussions.forEach(discussion => {
            const result = sentiment.analyze(discussion.content);
            if (result.score > 0) {
                positiveCount++;
            } else if (result.score < 0) {
                negativeCount++;
            } else {
                neutralCount++;
            }
            totalScore += result.score;
        });

        const averageScore = discussions.length > 0 ? totalScore / discussions.length : 0;

        const statistics = {
            totalDiscussions: discussions.length,
            positiveDiscussions: positiveCount,
            negativeDiscussions: negativeCount,
            neutralDiscussions: neutralCount,
            averageScore
        };

        res.status(200).json({ statistics });
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({ message: 'Error analyzing sentiment' });
    }
}




exports.analysisSentimentDiscussion = async (req, res) => {
    try {
        const sentiment = new Sentiment();
        const discussions = await Discussion.find();

        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        let totalScore = 0;

        discussions.forEach(discussion => {
            const result = sentiment.analyze(discussion.content);
            if (result.score > 0) {
                positiveCount++;
            } else if (result.score < 0) {
                negativeCount++;
            } else {
                neutralCount++;
            }
            totalScore += result.score;
        });

        const averageScore = discussions.length > 0 ? totalScore / discussions.length : 0;

        const statistics = {
            totalDiscussions: discussions.length,
            positiveDiscussions: positiveCount,
            negativeDiscussions: negativeCount,
            neutralDiscussions: neutralCount,
            averageScore
        };

        res.status(200).json({ statistics });
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({ message: 'Error analyzing sentiment' });
    }
}
