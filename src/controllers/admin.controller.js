const config = require("../configs/auth.config");
const User = require("../models/User");
const AboutUs = require('../models/aboutUs');

exports.getUsersWithAccountSwitchRequest = async (req,res)=>{
    try {
      const users = await User.find({ isDemandingToSwitchAccount: true });
      return res.status(200).send(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      throw error; // You can handle the error according to your application's needs
    }
}
exports.acceptSwitchRequest = async (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        // Handle case where user is not found
        console.error('User not found');
        return null; // or throw an error, depending on your use case
      }
  
      // Update the user's role
      user.role = "company";
      user.isDemandingToSwitchAccount=false;
      user.state ="validated";
      user.AlreadyCompany = true;
  
      // Save the updated user
      const updatedUser = await user.save();
  
      return res.status(200).send(updatedUser);
    } catch (error) {
      // Handle error, e.g., log it or return an error response
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  exports.getaboutus = async (req, res) => {
    try {
      const aboutUs = await AboutUs.findOne();
      if (!aboutUs) {
        console.log('No About Us content found in the database.');
        return res.status(404).json({ message: 'About Us content not found' });
      }
      res.json(aboutUs);
    } catch (err) {
      console.error('Error fetching About Us content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
    
  // Update About Us content
  exports.updateaboutus = async (req, res) => {
    try {
      const aboutUs = await AboutUs.findOne();
      aboutUs.content = req.body.content;
      await aboutUs.save();
      res.json(aboutUs);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  exports.initializeAboutUs = async (req, res) => {
    try {
      const aboutUs = await AboutUs.findOne();
      if (!aboutUs) {
        await AboutUs.create({ 
          content: `TektAI is a pioneering platform at the forefront of revolutionizing collaboration between industry challenges and data science developers. With a dynamic space for hosting competitions, fostering team collaboration, and recognizing outstanding contributions, TektAI is the nexus where innovation meets real-world problem-solving. Join us in creating a vibrant community where skills are honed, solutions are crafted, and the boundaries of what's possible in data science are continually pushed`
        });
        console.log('Default About Us content initialized.');
      }
    } catch (err) {
      console.error('Error initializing default About Us content:', err);
    }
  }
  