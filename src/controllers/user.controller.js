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
