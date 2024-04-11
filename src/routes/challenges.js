var express = require("express");
var router = express.Router();
var Challenge = require("../models/challenge");
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/AllChallenge', async (req, res) => {
    try {
        const challenge = await Challenge.find({  status: { $ne: 'archived' }});
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

router.get("/AllChallengeLanding", async (req, res) => {
  try {
  
    const challenge = await Challenge.find({
    status: 'open'
    }).sort({startDate:-1}).limit(3);

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
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

router.get("/AllChallengeLanding", async (req, res) => {
  try {
  
    const challenge = await Challenge.find({
    status: 'open'
    }).sort({startDate:-1}).limit(3);

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/OpenedChallenge", async (req, res) => {
  try {
    const challenge = await Challenge.find({ status: "open" });

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.get("/completedChallenge", async (req, res) => {
  try {
    const challenge = await Challenge.find({ status: "completed" });

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.get("/archivedChallenge", async (req, res) => {
  try {
    const challenge = await Challenge.find({ status: "archived" });

    if (!challenge || challenge.length === 0) {
      return res.status(404).json({ message: "Aucun challenge trouver " });
    }

    res.status(200).json(challenge);
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
    } else if (challenge.createdBy != userId) {
      return res.status(403).json({ message: "Unauthorized" });
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
module.exports = router;
