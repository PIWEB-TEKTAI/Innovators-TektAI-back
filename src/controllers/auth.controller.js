const config = require("../configs/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const User = require("../models/User");


exports.signin = async (req, res) => {
  const maxFailedAttempts = 3;
const lockoutDurationInMinutes = 60;

  try {

    const user = await User.findOne({ email: req.body.email }).populate('role', '-__v');


    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }


    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if(user.isExternalUser){
      return res.status(401).send({ message: 'you should google Sign in' });

    }
    if(user.state=='blocked'){
      return res.status(401).send({ message: 'you are blocked for some reasons' });
    }
 if(user.state=='archive'){
      return res.status(401).send({ message: 'User Not found' });
    }

    if (!passwordIsValid) {
      const now = new Date();
        if (
          user.lastFailedAttempt &&
          now - user.lastFailedAttempt > lockoutDurationInMinutes * 60 * 1000
        ) {
          user.failedLoginAttempts = 0;
        }
        user.failedLoginAttempts += 1;
        user.lastFailedAttempt = now;
        await user.save();

        if (user.failedLoginAttempts >= maxFailedAttempts) {
          return res.status(401).send({ message: 'maxFailedAttempts passed' });

        } else {
          return res.status(401).send({ message: 'Invalid Password!' });

        }
    }
   
    if (!user.isEmailVerified) {
      return res.status(401).send({ message: 'Please verify your email' });
    }
    console.log(user.isExternalUser)
  
    if (user.state !== 'validated' && user.role == 'company') {
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
    user.failedLoginAttempts = 0;
    user.lastFailedAttempt = null;
    user.UserConnectId=true;
    user.save();
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.status(200).send({
      _id:user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      token: token,
      FirstName:user.FirstName,
      imageUrl:user.imageUrl,
      LastName:user.LastName,
      wasReactivated: !user.isDeactivated && user.wasDeactivated,
      AlreadyCompany:user.AlreadyCompany,
      UserConnectId:true
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
        UserConnectId:true
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
            expiresIn: 259200, // 3 days
          }
        );
        console.log(token);
        res.cookie('token',token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        
        return res.status(201).json({ role: createdUser.role,
           FirstName:createdUser.FirstName,
           LastName:createdUser.LastName,
            imageUrl:createdUser.imageUrl,
           token, message: 'Google sign-in successful' });
      }
    } else if (user && user.isExternalUser == false) {
      return res.status(401).json({ message: "An account with the email address you're trying to use already exists. If you've previously signed up using a password, you can sign in directly. If you forgot your password, you can recover it. Alternatively, if you've signed up with Google using this email, please use the Google sign-in option." });
    } else if (user && user.isExternalUser == true) {
      if(user.state=='blocked'){
        return res.status(401).send({ message: 'you are blocked for some reasons' });
      }
      if(user.state=='archive'){
        return res.status(401).send({ message: 'User Not found' });
      }
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
          expiresIn: 259200, // 3 days
        }
      );
      res.cookie('token',token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      

      return res.status(200).json({ 
        _id:user._id,
        role: user.role ,
        FirstName:user.FirstName,
        LastName:user.LastName,
         imageUrl:user.imageUrl,
        token, message: 'Google sign-in successful',
        AlreadyCompany:user.AlreadyCompany
       });
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
      user.UserConnectId=false;
      await user.save();
  
      res.status(200).send({ message: 'Account deactivated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };


  exports.git = async (req, res) => {
    try {
      const CLIENT_ID = "bca5ee03a4266ebe1684";
      const CLIENT_SECRET = "e8325fb8a3f07d0a21597c5e00e2fa14c3d4558d";
      const params =
        "?client_id=" +
        CLIENT_ID +
        "&client_secret=" +
        CLIENT_SECRET +
        "&code=" +
        req.query.code;
  
      const response = await fetch("https://github.com/login/oauth/access_token" + params, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to retrieve access token from GitHub");
      }
  
      const data = await response.json();
  
      // Assuming 'data' contains access token and other user information
      const githubResponse = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
          Authorization: "token " + data.access_token,
        },
      });
  
      if (!githubResponse.ok) {
        throw new Error("Failed to retrieve user data from GitHub");
      }
  
      const githubUserData = await githubResponse.json();
  
      // Check if user with this email exists in the database
      let user = await User.findOne({ email: githubUserData.email });
  
      // If user doesn't exist, create a new one
      if (!user) {
        const userData = {
          FirstName: githubUserData.login,
          LastName: githubUserData.login,
          email: githubUserData.email,
          role: "challenger",
          isEmailVerified: true, // Assuming GitHub emails are always verified
          isExternalUser: true,
          state: "validated",
          password: "", // You might want to handle this differently
          isDemandingToSwitchAccount: false,
          AlreadyCompany: false,
        };
  
        user = new User(userData);
        await user.save();
        console.log("User created:", user);
      }
  
      // Return user data or any other response as needed
      res.json(user);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  


  exports.getUserData = async (req, res) => {
    req.get("Authorization");
    await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
    Authorization: req.get('Authorization')
    }
    })
    .then((response) => response.json())
    .then((data) => {
      res.json(data)
    })
  };
    