const config = require("../configs/auth.config");
const User = require("../models/user");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const user = require("../models/user");


exports.signin = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email }).populate('role', '-__v');
  
      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }
  
      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  
      if (!passwordIsValid) {
        return res.status(401).send({ message: 'Invalid Password!' });
      }
      if(!user.isEmailVerified){
        return res.status(401).send({ message: 'Please verify your email' });

      }
      if(user.state != "validated"){
        return res.status(401).send({ message: 'User not approved' });

      }

      const token = jwt.sign(
        { id: user.id , role: user.role,userName:user.FirstName + " " + user.LastName,occupation:user.occupation,email:user.email,imageUrl:user.imageUrl},
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        }
      );
  
      const authorities = [];
      authorities.push('ROLE_' + user.role.toUpperCase());
  
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      res.status(200).send({
        id: user._id,
        email: user.email,
        role: authorities,
        token:token
      });
      
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
exports.signout = (req, res) => {
    try {
      // Clear the token on the client side by setting an expired date
      res.cookie('token', '', { expires: new Date(0), httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });  
      res.status(200).send({ message: 'Sign-out successful.' });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
  
  exports.deactivateAccount = async (req, res) => {
    try {
      const { password } = req.body;
      
      // Find the user by ID
      const user = await User.findById(req.userId);
  
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare provided password with stored password
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({ message: 'Invalid Password!' });
      }
  
      // Update user's isDeactivated field to true
      user.isDeactivated = true;
      await user.save();
  
      res.status(200).send({ message: 'Account deactivated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
  