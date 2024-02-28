
const express = require('express');
const router = express.Router();
const User = require('../models/users');

// GET all users
router.get('/', function(req, res, next) {
    User.find()
        .then(users => {
            res.json({
                title: "Liste des utilisateurs",
                users: users
            });
        })
        .catch(err => {
            console.error("Erreur lors de la récupération des utilisateurs:", err);
            res.status(500).json({ error: "Erreur Interne du Serveur" });
        });
});

// GET user by ID
router.get('/:userId', function(req, res, next) {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            res.json(user);
        })
        .catch(err => {
            console.error("Erreur lors de la récupération de l'utilisateur:", err);
            res.status(500).json({ error: "Erreur Interne du Serveur" });
        });
});

// PUT to validate user by ID
router.get('/validate/:userId', function(req, res, next) {
  const userId = req.params.userId;

  User.findByIdAndUpdate(userId, { state: 'validated' }, { new: true })
      .then(updatedUser => {
          if (!updatedUser) {
              return res.status(404).json({ error: "Utilisateur non trouvé" });
          }
          res.json(updatedUser); // Renvoie l'utilisateur mis à jour
      })
      .catch(err => {
          console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
          res.status(500).json({ error: "Erreur Interne du Serveur" });
      });
});
// PUT to update user information by ID (additional endpoint for editing user info)
router.put('/update/:userId', function(req, res, next) {
    const userId = req.params.userId;
    const updatedData = req.body; // Assuming the updated user data is sent in the request body

    User.findByIdAndUpdate(userId, updatedData, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            res.json(updatedUser); // Renvoie l'utilisateur mis à jour
        })
        .catch(err => {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
            res.status(500).json({ error: "Erreur Interne du Serveur" });
        });
});

module.exports = router;
