const config = require("../configs/auth.config");
const User = require("../models/user");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


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
      if(user.isExternalUser){
        return res.status(401).send({ message: "You should sign in using you're google account" });
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
          res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
          
          return res.status(201).json({ token, message: 'Google sign-in successful' });
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
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        
        return res.status(200).json({ token, message: 'Google sign-in successful' });
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
  
