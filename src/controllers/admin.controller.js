const config = require("../configs/auth.config");
const User = require("../models/User");
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