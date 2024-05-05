var express = require('express');
var router = express.Router();
//const challenge = require('../models/Challenge');
const authMiddleware = require('../middlewares/authMiddleware');
const Challenge = require('../models/challenge'); // Import your Challenge model
const User = require('../models/User'); // Import your User model


router.get('/challenges', authMiddleware, async (req, res) => {
  const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir du jeton JWT
  console.log( userId);

  try {
    // Rechercher les défis créés par cet utilisateur
    const userChallenges = await Challenge.find({ createdBy: userId })
    .populate('createdBy', 'username'); // Populate username from User model

    // Envoyer les défis associés à cet utilisateur en réponse
    res.status(200).json(userChallenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.put('/archived/:id/update-status', authMiddleware, async (req, res) => {
  const userId = req.user.id; 
  const { id } = req.params; // Obtenez l'ID du défi à partir des paramètres de l'URL

  try {
    console.log("User ID:", userId);
    console.log("Challenge ID:", id);

    // Recherchez le défi par ID
    const challenge = await Challenge.findById(id);
    console.log("Challenge:", challenge);

    if (!challenge) {
      console.log("Challenge not found");
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Assurez-vous que l'utilisateur est autorisé à modifier ce défi
    if (challenge.createdBy !== userId) {
      console.log("Unauthorized");
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mettez à jour le statut du défi à 'archived'
    challenge.status = 'archived';
    console.log("Updated challenge:", challenge);

    // Sauvegarder le défi mis à jour
    await challenge.save();

    // Envoyer le défi mis à jour en réponse
    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/open/:id/update-status', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.createdBy !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mettez à jour le statut du défi à 'open'
    challenge.status = 'open';

    await challenge.save();

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const determineWinners = (challenge) => {
  const { submissions } = challenge;
  
  // Sort submissions by score in descending order
  const sortedSubmissions = submissions.slice().sort((a, b) => parseInt(b.score) - parseInt(a.score));
  
  const winners = [];
  
  // Add the first three submissions as winners (if available)
  for (let i = 0; i < Math.min(3, sortedSubmissions.length); i++) {
    winners.push(sortedSubmissions[i]);
  }
  
  return winners;
};

const determineRankings = (winners) => {
  const rankings = [];
  
  // Assign rankings to winners
  for (let i = 0; i < winners.length; i++) {
    if (i === 0) {
      rankings.push({ winner: winners[i], rank: 1 });
    } else if (i === 1) {
      rankings.push({ winner: winners[i], rank: 2 });
    } else if (i === 2) {
      rankings.push({ winner: winners[i], rank: 3 });
    }
  }
  
  return rankings;
};

const updateGlobalRankingAndPoints = async (winners, rankings) => {
  // Update global ranking and points for each winner
  for (let i = 0; i < winners.length; i++) {
    const winner = winners[i];
    const { rank } = rankings[i];
    
    // Update global ranking and points based on rank
    if (rank === 1) {
      // Update points for first place (15 points)
      winner.points += 15;
    } else if (rank === 2) {
      // Update points for second place (10 points)
      winner.points += 10;
    } else if (rank === 3) {
      // Update points for third place (5 points)
      winner.points += 5;
    }
    
    // Save the updated winner with global ranking and points
    await winner.save();
  }
};




router.put('/completed/:id/update-status', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.createdBy !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mettez à jour le statut du défi à 'open'
    challenge.status = 'completed';

    await challenge.save();
    const winners = determineWinners(challenge);

    // Calculate rankings
    const rankings = determineRankings(winners);

    // Update global ranking and points for winners
    await updateGlobalRankingAndPoints(winners, rankings);

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/globalranking', async (req, res) => {
  try {
    const globalRanking = await User.find({ role: 'challenger' }, 'FirstName LastName')
      .sort({ globalScore: -1 }) // Sort by points in descending order
      .limit(10); // Limit the results to top 10 challengers

    // Respond with the global ranking data
    res.status(200).json(globalRanking);
  } catch (error) {
    console.error('Error fetching global ranking:', error);
    // Respond with a generic error message
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;