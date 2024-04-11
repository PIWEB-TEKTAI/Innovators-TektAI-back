const config = require("../configs/auth.config");
const User = require("../models/User");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

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
  const userId = req.user.id;
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

    res.status(200).json({ message: 'company updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating company:', error);
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
exports.switchAccount = async (req, res) => {
  const userId = req.user.id;
  const updatedCompanyData = req.body; // Assuming company details are under 'company' property in the request body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { 'company': updatedCompanyData,
      isDemandingToSwitchAccount: true
     } },

      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    updatedUser.isDemandingToSwitchAccount = true;
    res.status(200).json({ message: 'Request for account switch added successfully', user: updatedUser });
  } catch (error) {
    console.error('Error acount switch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.directlySwitchAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if(user.role == "challenger"){
      newRole = "company"
    }else if(user.role == "company"){
      newRole = "challenger"
    }
    if (!user) {
      // Handle case where user is not found
      console.error('User not found');
      return res.status(404).send({message:"not found"}); // or throw an error, depending on your use case
    }

    // Update the user's role
    user.role = newRole;

    // Save the updated user
    const updatedUser = await user.save();

    return res.status(200).send(updatedUser);
  } catch (error) {
    // Handle error, e.g., log it or return an error response
    console.error('Error updating user role:', error);
    throw error;
  }
};

exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
