const config = require("../configs/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const User = require("../models/User");


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
   
    if (!user.isEmailVerified) {
      return res.status(401).send({ message: 'Please verify your email' });
    }


    if (user.state !== 'validated') {
      return res.status(401).send({ message: 'User not approved' });
    }


    if (user.isDeactivated) {
      // If the account was deactivated, reactivate it
      user.isDeactivated = false;
      await user.save();
   
      // Check if the account was previously deactivated
      if (!user.wasDeactivated) {
        // Set the flag indicating the user was previously deactivated
        user.wasDeactivated = true;
      }
   
      // Check if the account is still deactivated after saving
      if (user.isDeactivated) {
        return res.status(401).json({ message: 'User not reactivated' });
      } else {
        // Account reactivated successfully, update wasDeactivated flag
        user.wasDeactivated = true;
      }
    } else {
      // If the account is already active, ensure wasDeactivated is false
      user.wasDeactivated = false;
    }

    
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        userName: user.FirstName + ' ' + user.LastName,
        occupation: user.occupation,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      }
    );

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.status(200).send({
      id: user._id,
      email: user.email,
      role: user.role,
      token: token,
      // Include a flag indicating whether the account was reactivated
      wasReactivated: !user.isDeactivated && user.wasDeactivated,
    });


  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};


exports.signInWithGoogle = async (req, res) => {
  try {
    const data = req.body.user.data;
    const user = await User.findOne({ email: data.email });

    if (!user) {
      const userData = {
        FirstName: data.given_name,
        LastName: data.family_name,
        email: data.email,
        role: "challenger",
        isEmailVerified: data.verified_email,
        isExternalUser: true,
        state: "validated",
        password: "",
        isDemandingToSwitchAccount:false,
        AlreadyCompany:false,
      };

      const newUser = new User({
        ...userData,
      });

      // Use await with save to ensure user is saved before continuing
      const createdUser = await newUser.save();

      if (createdUser) {
        const token = jwt.sign(
          {
            id: createdUser.id,
            role: createdUser.role,
            userName: createdUser.FirstName + " " + createdUser.LastName,
            occupation: createdUser.occupation,
            email: createdUser.email,
            imageUrl: createdUser.imageUrl,
          },
          config.secret,
          {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
          }
        );
        console.log(token);
        res.cookie('token',token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        
        return res.status(201).json({ role: createdUser.role, token, message: 'Google sign-in successful' });
      }
    } else if (user && user.isExternalUser == false) {
      return res.status(401).json({ message: "An account with the email address you're trying to use already exists. If you've previously signed up using a password, you can sign in directly. If you forgot your password, you can recover it. Alternatively, if you've signed up with Google using this email, please use the Google sign-in option." });
    } else if (user && user.isExternalUser == true) {
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          userName: user.FirstName + " " + user.LastName,
          occupation: user.occupation,
          email: user.email,
          imageUrl: user.imageUrl,
        },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        }
      );
      res.cookie('token',token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      
      return res.status(200).json({ role: user.role ,token, message: 'Google sign-in successful' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
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
