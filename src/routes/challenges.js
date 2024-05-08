var express = require("express");
var router = express.Router();
var Challenge = require("../models/challenge");
const User = require('../models/User');
const authMiddleware = require("../middlewares/authMiddleware");
const Team = require("../models/team");

router.get('/AllChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({ 
          $and:[
            {status: { $ne: 'archived' }},
            {visibility:'Public'}
          ]});
       console.log(challenge)
    
        if (! challenge ||  challenge.length === 0) {
          return res.status(404).json({ message: 'Aucun challenge trouver ' });
        }
    
        res.status(200).json(challenge);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
router.get('/getChallengerSkills/:Id', async (req, res) => {
  const userId = req.params.Id;
  try {
    let userSkills = [];
    const allChallenges = await Challenge.find();

    if (userId == '-1') {
      res.status(200).json(allChallenges);

    }
    const user = await User.findById(userId);
    if (user) {
      userSkills = user.skills;
    }

    // Filtrer les challenges de type matching
    const matchingChallenges = allChallenges.filter(challenge => {
      const challengeSkills = challenge.targetedSkills || [];
      return challengeSkills.some(skill => userSkills.includes(skill));
    });

    // Filtrer les challenges qui ne sont pas de type matching
    const nonMatchingChallenges = allChallenges.filter(challenge => {
      const challengeSkills = challenge.targetedSkills || [];
      return !challengeSkills.some(skill => userSkills.includes(skill));
    });

    // Concaténer les challenges de type matching en premier
    const sortedChallenges = matchingChallenges.concat(nonMatchingChallenges);

    res.status(200).json(sortedChallenges);
  } catch (error) {
    console.error('Error fetching challenger skills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get("/AllChallengeLanding/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (userId === '-1') {
      const threeChallenges = await Challenge.find({ status: 'open', visibility: 'Public' }).limit(3);
      return res.status(200).json(threeChallenges);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userSkills = user.skills || [];
    
    const challenges = await Challenge.find({ status: 'open', visibility: 'Public' });

    const sortedChallenges = challenges
      .filter(challenge => {
        const challengeSkills = challenge.targetedSkills || [];
        return challengeSkills.some(skill => userSkills.includes(skill));
      })
    // Filtrer les challenges qui ne sont pas de type matching
    const nonMatchingChallenges = challenges.filter(challenge => {
      const challengeSkills = challenge.targetedSkills || [];
      return !challengeSkills.some(skill => userSkills.includes(skill));
    });

    if (sortedChallenges.length === 0) {
      const threeChallenges = await Challenge.find({ status: 'open', visibility: 'Public' }).limit(3);
      return res.status(200).json(threeChallenges); 
       }
    
    const landingChallenges = sortedChallenges.concat(nonMatchingChallenges).slice(0,3);

    res.status(200).json(landingChallenges);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/OpenedChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({ 
          $and:[
            {status:'open'},
            {visibility:'Public'}
          ]});
    
    
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
        const challenge = await Challenge.find({ 
          $and:[
            {status: 'completed'},
            {visibility:'Public'}
          ]});
    
    
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
    const challenge = await Challenge.find({ status: { $ne: "archived" } });
    console.log(challenge);

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});




router.get("/challenge/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const challenge = await Challenge.findById({ _id: id });

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/challenges/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const challenge = await Challenge.findById({ _id: id });

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.post("/AddChallenger", async function (req, res) {
  const { title, description, price, image, endDate, targetedSkills } =
    req.body;

  const newChallenge = new Challenge({
    title,
    description,
    price,
    image,
    endDate: new Date(endDate), // Assurez-vous de convertir endDate en objet Date
    targetedSkills,
    dataset: [
      {
        name: title, // ou un nom approprié de dataset
        description,
        fileUrl: image, // ou une URL de fichier appropriée
      },
    ],
    // Assumer que createdBy doit être défini selon l'utilisateur actuel
    //createdBy: req.user._id,
  });

  newChallenge
    .save()
    .then(() => {
      res.send("Défi ajouté avec succès !");
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout du défi :", error);
      res.status(500).send("Erreur serveur");
    });
});

router.put("/:id/updateStatus", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const newStatus = req.body.status;
    console.log("userid" + id + "completed");

    // Utilisation de findOneAndUpdate pour trouver et mettre à jour le défi
    const challenge = await Challenge.findOneAndUpdate(
      { _id: id }, // Utilisation de _id au lieu de id pour rechercher par ID
      { $set: { status: newStatus } },
      { new: true } // Pour obtenir le défi mis à jour
    );

    if (!challenge) {
      return res.status(404).json({ message: "Challenge non trouvé" });
    }

    res
      .status(200)
      .json({
        message: "Changement de statut du défi effectué",
        challenge: challenge,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/get", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir du jeton JWT
  console.log(userId);

  try {
    // Rechercher les défis créés par cet utilisateur
    const userChallenges = await Challenge.find({ createdBy: userId }).populate(
      "createdBy",
      "username"
    ); // Populate username from User model

    console.log(userChallenges);
    // Envoyer les défis associés à cet utilisateur en réponse
    res.status(200).json(userChallenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.put("/archived/:id/update-status", authMiddleware, async (req, res) => {
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
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Assurez-vous que l'utilisateur est autorisé à modifier ce défi
    else if (challenge.createdBy != userId) {
      console.log("Unauthorized");
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Mettez à jour le statut du défi à 'archived'
    challenge.status = "archived";
    console.log("Updated challenge:", challenge);

    // Sauvegarder le défi mis à jour
    await challenge.save();

    // Envoyer le défi mis à jour en réponse
    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/open/:id/update-status", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    } else if (challenge.createdBy != userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Mettez à jour le statut du défi à 'open'
    challenge.status = "open";

    await challenge.save();

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/completed/:id/update-status", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log("userid" + userId + "completed");
  try {
    const challenge = await Challenge.findById(id);

    console.log("createdBy" + challenge.createdBy);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    } 

    // Mettez à jour le statut du défi à 'open'
    challenge.status = "completed";

    await challenge.save();

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getMyChallenges", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir du jeton JWT

  try {
    // Rechercher les défis créés par cet utilisateur
    const userChallenges = await Challenge.find({ createdBy: userId })
      .populate({
        path: 'createdBy',
        select: 'FirstName' // Sélectionner uniquement le champ 'username' de l'utilisateur
      });

    // Envoyer les défis associés à cet utilisateur en réponse
    res.status(200).json(userChallenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});








router.get("/MyChallenge", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir du jeton JWT
  console.log(userId);

  try {
    // Rechercher les défis créés par cet utilisateur
    const userChallenges = await Challenge.find({ createdBy: userId }).populate(
      "createdBy",
      "username"
    ); // Populate username from User model

    console.log(userChallenges);
    // Envoyer les défis associés à cet utilisateur en réponse
    res.status(200).json(userChallenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



router.get("/participations", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir du jeton JWT
  try {
    // Rechercher tous les défis
    const challenges = await Challenge.find({ createdBy: userId });

    if (!challenges || challenges.length === 0) {
      return res.status(404).json({ message: "Aucun défi trouvé." });
    }

    // Retourner les participations des défis trouvés avec les titres
    const participations = challenges.map(async challenge => {
      const participation = {
        title: challenge.title, // Ajouter le titre du challenge
        soloParticipants: [],
        soloParticipationRequests: [],
        teamParticipants: [],
        teamParticipationRequests: []
      };

      // Récupérer les détails des participants solo
      for (const participantId of challenge.participations.soloParticipants) {
        const user = await User.findById(participantId);
        if (user) {
          participation.soloParticipants.push({
            _id: user._id,
            FirstName: user.FirstName,
            LastName: user.LastName,
            imageUrl: user.imageUrl // Ajout de l'URL de l'image

          });
        }
      }

      // Récupérer les détails des demandes de participation solo
      for (const requestId of challenge.participations.soloParticipationRequests) {
        const user = await User.findById(requestId);
        if (user) {
          participation.soloParticipationRequests.push({
            _id: user._id,
            FirstName: user.FirstName,
            LastName: user.LastName,
            imageUrl: user.imageUrl // Ajout de l'URL de l'image

          });
        }
      }

      // Récupérer les détails des participants d'équipe et leurs leaders
      for (const teamId of challenge.participations.TeamParticipants) {
        const team = await Team.findById(teamId);
        if (team) {
          const leader = await User.findById(team.leader);
          if (leader) {
            participation.teamParticipants.push({
              _id: team._id,
              name: team.name,
              imageUrl: team.imageUrl ,// Ajout de l'URL de l'image  

              leader: {
                FirstName: leader.FirstName,
                LastName: leader.LastName,
              }
            });
          }
        }
      }

      // Récupérer les détails des demandes de participation d'équipe et leurs leaders
      for (const requestId of challenge.participations.TeamParticipationRequests) {
        const team = await Team.findById(requestId);
        if (team) {
          const leader = await User.findById(team.leader);
          if (leader) {
            participation.teamParticipationRequests.push({
              _id: team._id,
              name: team.name,
              imageUrl: team.imageUrl ,// Ajout de l'URL de l'image  
              leader: {
                FirstName: leader.FirstName,
                LastName: leader.LastName,

              }
            });
          }
        }
      }

      return participation;
    });

    // Attendre la résolution de toutes les promesses pour obtenir les participations
    const resolvedParticipations = await Promise.all(participations);

    res.status(200).json(resolvedParticipations);
  } catch (error) {
    console.error("Erreur lors de la récupération des participations :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des participations." });
  }
});


router.get('/AfficherChallenges', async (req, res) => {
  try {
      const challenges = await Challenge.find();
  
      if (!challenges || challenges.length === 0) {
          return res.status(404).json({ message: 'Aucun challenge trouvé' });
      }
  
      res.status(200).json(challenges);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
  });
router.put("/Favories/:idChallenger/:idUser", async (req, res) => {
  
  const { idChallenger, idUser } = req.params; // Id du challenge et de l'utilisateur

  try {
    // Vérifiez si l'identifiant de l'utilisateur est correct
    
    const user = await User.findById(idUser);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vérifiez si l'utilisateur a déjà ajouté ce challenge à ses favoris
    if (user.favories.includes(idChallenger)) {
      return res.status(400).json({ message: "Challenge already in favorites" });
    }

    // Ajoutez l'identifiant du challenge aux favoris de l'utilisateur
    user.favories.push(idChallenger);

    // Enregistrez les modifications dans la base de données
    await user.save();

    res.status(200).json({ message: "Challenge added to favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/Unfavorite/:idChallenger/:idUser", async (req, res) => {
  const { idChallenger, idUser } = req.params; // ID du défi et de l'utilisateur

  try {
    // Vérifiez si l'identifiant de l'utilisateur est correct
    const user = await User.findById(idUser);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vérifiez si l'utilisateur a déjà ajouté ce défi à ses favoris
    const index = user.favories.indexOf(idChallenger);
    if (index === -1) {
      return res.status(400).json({ message: "Challenge is not in favorites" });
    }

    // Retirez l'identifiant du défi des favoris de l'utilisateur
    user.favories.splice(index, 1);

    // Enregistrez les modifications dans la base de données
    await user.save();

    res.status(200).json({ message: "Challenge removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/favorites/:idUser", authMiddleware , async (req, res) => {
  const { idUser } = req.params; // ID de l'utilisateur

  try {
    // Recherchez l'utilisateur dans la base de données
    const user = await User.findById(idUser);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Récupérez les favoris de l'utilisateur
    const favorites = user.favories;

    // Récupérez tous les champs des challenges associés aux IDs des favoris de l'utilisateur
    const challenges = await Promise.all(favorites.map(async (favoriteId) => {
      const challenge = await Challenge.findById(favoriteId);
      return challenge; // Retourne le challenge trouvé pour cet ID
    }));
    console.log(challenges)

    res.status(200).json(challenges); // Retourne la liste des challenges associés aux favoris de l'utilisateur
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
  

module.exports=router;