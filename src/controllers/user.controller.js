const config = require("../configs/auth.config");
const User = require("../models/User");
const Team = require("../models/team");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const express = require('express');
const router = express.Router();

const projectId = 'tektai-crn9'; // Replace with your Dialogflow project ID
const path = require('path');
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'tektai-crn9-1f476cf8b62d.json');
const { SessionsClient } = require('dialogflow');
const sessionClient = new SessionsClient();

const { v4: uuidv4 } = require('uuid');

// Function to generate a temporary session ID
const generateTempSessionId = () => {
  return uuidv4(); // Generates a random UUID
};

// Create a new session client
exports.chatbot = async (req, res) => {
  const { message } = req.body;

  // Check if there's a session ID in the request, otherwise generate a temporary one
  const userId = req.user ? req.user.id : req.cookies.tempSessionId || generateTempSessionId();

  // If user is not authenticated, set a temporary session ID in the cookie
  if (!req.user && !req.cookies.tempSessionId) {
    res.cookie('tempSessionId', userId, { maxAge: 86400000, httpOnly: true }); // Set cookie for 24 hours
  }

  // Construct sessionPath using the session ID
  const sessionPath = sessionClient.sessionPath(projectId, userId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ response: result.fulfillmentText });
  } catch (error) {
    console.error('Error communicating with Dialogflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const challengers = await User.find({ role: 'challenger' });
    const teams = await Team.find();
    
    // Combine challengers and teams into a single array
    const allUsers = [...challengers, ...teams];
    
    // Sort the combined array by globalScore in descending order
    allUsers.sort((a, b) => b.globalScore - a.globalScore);
    
    res.json({ allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  exports.updateTeamScore = async (req, res) => {
    try {
      const  { id }  = req.params;
      const  { globalScore } = req.body;
  
      // Update team score in the database
    const team =  await Team.findByIdAndUpdate(id, { $inc: { globalScore: globalScore } });

      res.status(200).json({ message: 'Team score updated successfully' , team });
    } catch (error) {
      console.error('Error updating team score:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


exports.updateUserScore = async (req, res) => {
  try {
    const { id }  = req.params;
    const  { globalScore }  = req.body;

    // Update user score in the database
    const user = await User.findByIdAndUpdate(id, { $inc: { globalScore: globalScore } });
    res.status(200).json({ message: 'User score updated successfully' , user });
  } catch (error) {
    console.error('Error updating user score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





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
      {
        $set: {
          'company': updatedCompanyData,
          isDemandingToSwitchAccount: true
        }
      },

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
    if (user.role == "challenger") {
      newRole = "company"
    } else if (user.role == "company") {
      newRole = "challenger"
    }
    if (!user) {
      // Handle case where user is not found
      console.error('User not found');
      return res.status(404).send({ message: "not found" }); // or throw an error, depending on your use case
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

exports.getAllChallengers = async (req, res) => {
  try {
    const challengers = await User.find({ role: 'challenger' });
    res.json(challengers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserPreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    // Retrieve the user document from the database, populating the 'company' field
    const user = await User.findById(userId).populate('company');

    // Ensure that the user document exists and contains the 'company' field
    if (!user || !user.company) {
      return res.status(404).json({ message: 'User or company not found' });
    }

    // Respond with the user document and relevant company information
    res.status(200).json({
      message: 'User preferences retrieved successfully',
      user: {
        _id: user._id,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateCompanyPreferences = async (req, res) => {
  const userId = req.user.id;
  const { autoAcceptRequests } = req.body;

  try {
    // Retrieve the user document from the database, populating the 'company' field
    const user = await User.findById(userId).populate('company');

    // Ensure that the user document exists and contains the 'company' field
    if (!user || !user.company) {
      return res.status(404).json({ message: 'User or company not found' });
    }

    // Update the 'autoAcceptRequests' property of the 'company' object
    user.company.autoAcceptRequests = autoAcceptRequests;

    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with the updated user document and relevant company information
    res.status(200).json({
      message: 'Company preferences updated successfully',
      user: {
        _id: updatedUser._id,
        company: updatedUser.company
      }
    });
  } catch (error) {
    console.error('Error updating company preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





