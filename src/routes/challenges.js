var express = require('express');
var router = express.Router();
var Challenge=require('../models/challenge')
router.get('/AllChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({  status: { $ne: 'archived' }});
    
    
        if (! challenge ||  challenge.length === 0) {
          return res.status(404).json({ message: 'Aucun challenge trouver ' });
        }
    
        res.status(200).json(challenge);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
router.get('/OpenedChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({  status:'open'});
    
    
        if (! challenge ||  challenge.length === 0) {
          return res.status(404).json({ message: 'Aucun challenge trouver ' });
        }
    
        res.status(200).json(challenge);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
router.get('/completedChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({  status:'completed'});
    
    
        if (! challenge ||  challenge.length === 0) {
          return res.status(404).json({ message: 'Aucun challenge trouver ' });
        }
    
        res.status(200).json(challenge);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
router.get('/archivedChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({  status:'archived'});
    
    
        if (! challenge ||  challenge.length === 0) {
          return res.status(404).json({ message: 'Aucun challenge trouver ' });
        }
    
        res.status(200).json(challenge);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});

router.get('/challenge/:id', async (req, res) => {
  try {
      const id=req.params.id;
      const challenge = await Challenge.findById({_id:id});
  
  
      if (! challenge ||  challenge.length === 0) {
        return res.status(404).json({ message: 'Aucun challenge trouver ' });
      }
  
      res.status(200).json(challenge);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
});
router.post('/AddChallenger', async function (req, res) {
    const { title, description, price, image, endDate, targetedSkills } = req.body;
  
    const newChallenge = new Challenge({
      title,
      description,
      price,
      image,
      endDate: new Date(endDate), // Assurez-vous de convertir endDate en objet Date
      targetedSkills,
      dataset: [{
        name: title, // ou un nom approprié de dataset
        description,
        fileUrl: image, // ou une URL de fichier appropriée
      }],
      // Assumer que createdBy doit être défini selon l'utilisateur actuel
      //createdBy: req.user._id,
    });
  
    newChallenge.save()
      .then(() => {
        res.send("Défi ajouté avec succès !");
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du défi :", error);
        res.status(500).send("Erreur serveur");
      });
  });

  
  router.put('/:id/updateStatus', async (req, res) => {
    try {
      const id = req.params.id;
      const newStatus = req.body.status;
  
      // Utilisation de findOneAndUpdate pour trouver et mettre à jour le défi
      const challenge = await Challenge.findOneAndUpdate(
        { _id: id }, // Utilisation de _id au lieu de id pour rechercher par ID
        { $set: { status: newStatus } },
        { new: true } // Pour obtenir le défi mis à jour
      );
  
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge non trouvé' });
      }
  
      res.status(200).json({ message: 'Changement de statut du défi effectué', challenge: challenge });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
module.exports = router;