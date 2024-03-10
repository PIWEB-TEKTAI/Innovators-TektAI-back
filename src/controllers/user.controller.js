const config = require("../configs/auth.config");
const User = require("../models/user");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const user = require("../models/user");


exports.profile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is in the request parameters

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Return the user data
    return res.status(200).send({ user });
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
  };

exports.imageUpload = async (req, res) => {
  console.log("upload");
  const userId = req.user.id;
  console.log(req.file);
  const userObject = req.file
    ? {
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };
  const user = await User.findByIdAndUpdate(
    userId,
    userObject,
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new NotFoundError(`NO user with id ${userId}`);
  }

  res.status(200).json(user);
};

exports.updatedUser = async (req, res) => {
  const userId = req.user.id;
  let updatedUserData = req.body;

  try {
    
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updateCompany = async (req, res) => {
  const userId = req.user.id;
  const updatedCompanyData = req.body; // Assuming company details are under 'company' property in the request body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { 'company': updatedCompanyData } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.checkEmailUnique = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({ isUnique: false });
    } else {
      return res.status(200).json({ isUnique: true });
    }
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// Fonction pour récupérer les statistiques du nombre de challengers, d'entreprises et d'administrateurs
exports.getStats = async (req, res) => {
  try {
    const { period } = req.body;

    let startDate, endDate;

    if (period === 'lastMonth') {
      const today = new Date();
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startDate = firstDayOfLastMonth;
      endDate = new Date(firstDayOfLastMonth.getFullYear(), firstDayOfLastMonth.getMonth() + 1, 0);
    } else if (period === 'thisWeek') {
      // Logique pour définir les dates de début et de fin pour la semaine en cours
      // Ici, vous pouvez utiliser des bibliothèques comme moment.js ou écrire votre propre logique pour calculer les dates
    }

    const challengerCount = await User.countDocuments({ role: 'challenger', createdAt: { $gte: startDate, $lte: endDate } });
    const companyCount = await User.countDocuments({ role: 'company', createdAt: { $gte: startDate, $lte: endDate } });
    const adminCount = await User.countDocuments({ role: 'admin', createdAt: { $gte: startDate, $lte: endDate } });

    return res.status(200).json({ challengerCount, companyCount, adminCount });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};