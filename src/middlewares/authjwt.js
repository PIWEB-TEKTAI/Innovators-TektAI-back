const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config");
const User = require("../models/User");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
            config.secret,
            (err, decoded) => {
              if (err) {
                return res.status(401).send({
                  message: "Unauthorized!",
                });
              }
              req.userId = decoded.id;
              next();
            });
};
const isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
  
      // Check if the user has the "admin" role
      if (user.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "Require Admin Role!" });
      }
    });
};
  
const isSuperAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
  
      // Check if the user has the "admin" role
      if (user.role === "super admin") {
        next();
      } else {
        return res.status(403).send({ message: "Require super Admin Role!" });
      }
    });
};
const isChallenger = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
  
      // Check if the user has the "admin" role
      if (user.role === "challenger") {
        next();
      } else {
        return res.status(403).send({ message: "Require challenger Role!" });
      }
    });
};
const isCompany = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
  
      // Check if the user has the "admin" role
      if (user.role === "company") {
        next();
      } else {
        return res.status(403).send({ message: "Require company Role!" });
      }
    });
};
const verifyAndDecodeToken= (req, res, next) => {
  // Extract the token from the HTTP-only cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token, config.secret);
    
    // Attach the decoded token to the request for further use
    req.decodedToken = decodedToken;

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isSuperAdmin,
    isChallenger,
    isCompany,
    verifyAndDecodeToken
  };
module.exports = authJwt;