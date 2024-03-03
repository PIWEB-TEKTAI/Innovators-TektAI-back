const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour le téléchargement d'image
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'images'); // Répertoire de destination pour stocker les images
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix); // Nom du fichier avec un suffixe unique
  }
});

const upload = multer({ storage: storage });

// Définition de la fonction imageUpload
exports.imageUpload = async (req, res) => {
  console.log("upload")
  const userId = req.user.id
  console.log(req.file)
  const userObject = req.file ?{
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }
  const user = await User.findByIdAndUpdate({ _id: userId }, userObject, { new: true, runValidators: true })
  if (!user) {
    throw new NotFoundError(`NO user with id ${userId}`)
  }

  res.status(200).json(user)
}
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

// POST pour télécharger l'image d'utilisateur par ID
router.post('/:userId/image', upload.single('image'), function(req, res, next) {
    const userId = req.params.userId;
    const imageUrl = req.file.path; // Chemin de l'image téléchargée

    // Mettre à jour l'URL de l'image dans la base de données pour l'utilisateur spécifié
    User.findByIdAndUpdate(userId, { imageUrl: imageUrl }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            res.json(updatedUser); // Renvoie l'utilisateur mis à jour avec l'URL de l'image
        })
        .catch(err => {
            console.error("Erreur lors de la mise à jour de l'URL de l'image de l'utilisateur:", err);
            res.status(500).json({ error: "Erreur Interne du Serveur" });
        });
});
// GET user image by ID
// GET user image by ID
router.get('/:userId/image', function(req, res, next) {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            if (!user.imageUrl) {
                return res.status(404).json({ error: "Image non trouvée pour cet utilisateur" });
            }
            // Obtenir un chemin absolu vers le fichier image
            const imagePath = path.resolve(user.imageUrl);
            // Renvoie l'image en tant que fichier
            res.sendFile(imagePath);
        })
        .catch(err => {
            console.error("Erreur lors de la récupération de l'image de l'utilisateur:", err);
            res.status(500).json({ error: "Erreur Interne du Serveur" });
        });
});

router.get('/role/:role', function(req, res, next) {
    const role = req.params.role;

    User.find({ role: role })
        .then(users => {
            res.json({
                title: `Utilisateurs avec le rôle ${role}`,
                users: users
            });
        })
        .catch(err => {
            console.error("Erreur lors de la récupération des utilisateurs par rôle:", err);
            res.status(500).json({ error: "Erreur Interne du Serveur" });
        });
});

module.exports = router;