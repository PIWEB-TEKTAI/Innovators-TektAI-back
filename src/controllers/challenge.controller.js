const Challenge = require("../models/Challenge");


exports.viewDetailschallenge = async (req, res) => {
    const challengeId = req.params.id;

    try {
        // Find the challenge by ID in the database
        const challenge = await Challenge.findById(challengeId);

        // Check if the challenge exists
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Return the challenge details
        return res.status(200).json(challenge);
    } catch (error) {
        // Handle any errors
        console.error('Error retrieving challenge details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.ChallengesStatics = async (req, res) => {
    try {
        // Fetch all challenges from the database
        const challenges = await Challenge.find();

        // Calculate statistics
        const totalChallenges = challenges.length;
        const openChallenges = challenges.filter(challenge => challenge.status === 'open').length;
        const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;
        const archivedChallenges = challenges.filter(challenge => challenge.status === 'archived').length;

        // Return the statistics along with the challenges
        return res.status(200).json({
            challenges,
            statistics: {
                totalChallenges,
                openChallenges,
                completedChallenges,
                archivedChallenges
            }
        });
    } catch (error) {
        console.error('Error retrieving challenges:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
