var express = require('express');
var router = express.Router();
var Submissions=require('../models/Submission')
router.get('/AllSubmissions', async (req, res) => {
    try {
        const Submission = await Submissions.find();
    
    
        if (! Submission||  Submission.length === 0) {
          return res.status(404).json({ message: 'Aucun Submission trouver ' });
        }
    
        res.status(200).json(Submission);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
router.get('/SubmissionsByIdChallenge/:id', async (req, res) => {
  try {
      var id = req.params.id;
      const Submission = await Submissions.find({challengeId:id});
  
  
      if (! Submission||  Submission.length === 0) {
        return res.status(404).json({ message: 'Aucun Submission trouver ' });
      }
  
      res.status(200).json(Submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
});
router.post('/AddSubmission', async function (req, res) {
  const { challengeId, description, files } = req.body;

  try {
    const newSubmission = new Submissions({
      challengeId,
      submittedBy: "65f361a69ba32433d850d13b", // Remplacez "65f361a69ba32433d850d13b" par l'ID réel de l'utilisateur
      description,
      files,
      status: 'pending',
    });

    await newSubmission.save();

    res.send("Soumission ajoutée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la soumission :", error);
    res.status(500).send("Erreur serveur");
  }
});
module.exports = router;