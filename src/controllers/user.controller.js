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

exports.imageUpload = async (req, res)=>{
  console.log("upload")
  const userId = req.user.id
  console.log(req.file)
  const userObject = req.file ?{
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  }:{ ...req.body }
  const user = await User.findByIdAndUpdate({ _id:userId } ,userObject , { new:true ,runValidators: true })
  if(!user){
      throw new NotFoundError(`NO user with id ${userId}`)
  }
  
  res.status(200).json( user )
}
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