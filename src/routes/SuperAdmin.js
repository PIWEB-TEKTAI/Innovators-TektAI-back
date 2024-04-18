var express = require('express');
var router = express.Router();
const User = require('../models/User'); // Import your User model
var bcrypt = require("bcryptjs");




router.get('/All', async (req, res) => {
  try {
    const companies = await User.find({  state: { $ne: 'archive' } });


    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur avec le rôle "company" trouvé' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/challenger', async (req, res) => {
  try {
    const companies = await User.find({ role: 'challenger', state: { $ne: 'archive' } });


    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur avec le rôle "company" trouvé' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/company', async (req, res) => {
  try {
    const companies = await User.find({ role: 'company', state: { $ne: 'archive' }  });

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur avec le rôle "company" trouvé' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/Archive', async (req, res) => {
  try {
    const companies = await User.find({ state: 'archive' });

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur avec le rôle "archive" trouvé' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/admin', async (req, res) => {
  try {
    const companies = await User.find({ role: 'admin', state: { $ne: 'archive' }  });

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur avec le rôle "company" trouvé' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/:email', async (req, res) => {
    try {
        const email=req.params.email;
        const superadmin = await User.findOne({email:email});
        if (!superadmin) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
          }
      
          res.status(200).json(superadmin);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Erreur serveur' });
        }
});
router.put('/:email/updateChallengerToCompany', async (req, res) => {
  try {
    const email = req.params.email;

    const Newname = req.body.company.name;
    const Newaddress = req.body.company.address;
    const NewemailCompany = req.body.company.email;
    const Newdescription = req.body.company.description;
    const Newphone = req.body.company.phone;
    const NewprofessionnalFields = [];


    const user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          'company.name': Newname,
          'company.address': Newaddress,
          'company.email': NewemailCompany,
          'company.description': Newdescription,
          'company.phone': Newphone,
          'company.professionnalFields': NewprofessionnalFields,
          'role':'company',
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Switch to company succesfully', user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});





    router.put('/:email/updateState', async (req, res) => {
      try {
          const email = req.params.email;
          const newState = req.body.state; 
      
          const user = await User.findOneAndUpdate({ email: email }, { $set: { state: newState } }, { new: true });
      console.log(user);
          if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
          }
      
          res.status(200).json({ message: 'user state changes', user: user });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Erreur serveur' });
        }
      });

      router.post('/AddAdminBySA', async function (req, res) {
        const salt =await bcrypt.genSalt(10)
    const cryptedPassword= await bcrypt.hash(req.body.password, salt)
    const newAdmin = new User({
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      email: req.body.email,
      password: cryptedPassword,
      occupation:'AdminAccess',
      state: 'validated',
      role: 'admin',
      isEmailVerified:true,
      permissions: req.body.permissions, 
    });
    
      newAdmin.save()
        .then(() => {
          res.send("Admin added");
        })
        .catch((error) => {
          console.error("Error adding admin:", error);
          res.status(500).send("Internal Server Error");
        });
    });
  router.post('/AddSAdminBySA', async function (req, res) {
    const salt =await bcrypt.genSalt(10)
const cryptedPassword= await bcrypt.hash(req.body.password, salt)
const newAdmin = new User({
  FirstName: req.body.FirstName,
  LastName: req.body.LastName,
  email: req.body.email,
  password: cryptedPassword,
  occupation:'AdminAccess',
  state: 'validated',
  role: 'SuperAdmin',
  permissions: req.body.permissions, 
});

  newAdmin.save()
    .then(() => {
      res.send("Admin added");
    })
    .catch((error) => {
      console.error("Error adding admin:", error);
      res.status(500).send("Internal Server Error");
    });
});
//Ajouter un Challanger Account
router.post('/AddChallengerByAdmin',async function(req,res)
{
  const salt =await bcrypt.genSalt(10)
  const cryptedPassword= await bcrypt.hash(req.body.password, salt)
    new User({
        FirstName:req.body.FirstName,
        LastName:req.body.LastName,
        email:req.body.email,
        password:cryptedPassword,
        imageUrl:req.body.imageUrl,
        birthDate:req.body.birthDate,
        phone:req.body.phone,
        address:req.body.address,
        occupation:req.body.occupation,
        Description:req.body.Description,
        Education:req.body.Education,
        Skills:req.body.Skills,
        isEmailVerified:true,
        state:'not validated',
        role:'challenger',
        company: {
      name: null,
      address: null,
      emailCompany: null,
      description: null,
      phone: null,
      professionnalFields: "no",
    },
   
    }).save(res.send("challenger added"))
});



router.post('/AddCompanyByAdmin', async function (req, res) {
  const salt =await bcrypt.genSalt(10)
  const cryptedPassword= await bcrypt.hash(req.body.password, salt)
  const newUser = new User({
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    email: req.body.email,
    password: cryptedPassword,
    imageUrl: req.body.imageUrl,
    birthDate: req.body.birthDate,
    phone: req.body.phone,
    address: req.body.address,
    occupation: req.body.occupation,
    Description: req.body.Description,
    Education: req.body.Education,
    Skills: req.body.Skills,
    isEmailVerified: true,
    state: 'validated',
    role: 'company',
    company: {
      name: req.body.company.name,
      address: req.body.company.address,
      emailCompany: req.body.emailCompany,
      description: req.body.company.description,
      phone: req.body.company.phone,
      professionnalFields: [],
    },
  });

  newUser
    .save()
    .then(() => {
      res.send("Company added");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});


router.post('/AddChallengerNormal',async function(req,res)
{
  const salt =await bcrypt.genSalt(10)
  const cryptedPassword= await bcrypt.hash(req.body.password, salt)
    new User({
        FirstName:req.body.FirstName,
        LastName:req.body.LastName,
        email:req.body.email,
        password:cryptedPassword,
        imageUrl:req.body.imageUrl,
        phone:req.body.phone,
        address:req.body.address,
        occupation:req.body.occupation,
        Description:req.body.Description,
        Education:req.body.Education,
        Skills:req.body.Skills,
        isEmailVerified:false,
        state:'not validated',
        role:'challenger'
    }).save(res.send("challenger added"))
})
router.post('/checkUniqueEmail', async (req, res) => {
    try {
      const { email } = req.body;
  
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        res.json({ isUnique: true });
      } else {
        res.json({ isUnique: false });
      }
    } catch (error) {
      console.error('Error checking unique email:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// PUT to validate user byemail 
router.get('/validate/:email', function(req, res, next) {
  const userId = req.params.email;

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
// PUT to update user information by email  (additional endpoint for editing user info)
router.put('/update/:email', function(req, res, next) {
  const email = req.params.email;
  const updatedData = req.body;

  User.findOneAndUpdate({ email: email }, updatedData, { new: true })
      .then(updatedUser => {
          if (!updatedUser) {
              return res.status(404).json({ error: "Utilisateur non trouvé" });
          }
          res.json(updatedUser);
      })
      .catch(err => {
          console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
          res.status(500).json({ error: "Erreur Interne du Serveur" });
      });
});
router.get('/All', async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/challenger', async (req, res) => {
  try {
    const companies = await User.find({ role: 'challenger', state: { $ne: 'archive' } });


    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur avec le rôle "company" trouvé' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.get('/challenges/:email', async (req, res) => {
  try {
    const userEmail = req.params.email; // Récupérer l'email de l'utilisateur depuis les paramètres de l'URL

    // Trouver les challenges créés par l'utilisateur spécifié
    const userChallenges = await Challenge.find({ createdBy: userEmail });

    // Envoyer les challenges associés à cet utilisateur en réponse
    res.status(200).json(userChallenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/:userId/favoriteChallenge/:challengeId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const challengeId = req.params.challengeId;

    // Recherchez l'utilisateur avec l'ID spécifié
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajouter le challengeId à la liste des favoris de l'utilisateur s'il n'est pas déjà présent
    if (!user.favoris.includes(challengeId)) {
      user.favoris.push(challengeId);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Challenge ajouté aux favoris avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un challenge des favoris de l'utilisateur
router.delete('/:userId/favoriteChallenge/:challengeId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const challengeId = req.params.challengeId;

    // Recherchez l'utilisateur avec l'ID spécifié
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer le challengeId de la liste des favoris de l'utilisateur s'il est présent
    user.favoris = user.favoris.filter(favorite => favorite.toString() !== challengeId);
    await user.save();

    res.status(200).json({ success: true, message: 'Challenge supprimé des favoris avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Afficher tous les challenges favoris de l'utilisateur
router.get('/:userId/favoriteChallenges', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Recherchez l'utilisateur avec l'ID spécifié, en population la liste des favoris
    const user = await User.findById(userId).populate('favoris');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(user.favoris);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;