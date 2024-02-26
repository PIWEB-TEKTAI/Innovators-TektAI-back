// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const config = require('../configs/auth.config'); // Include your configuration file

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    req.user = decoded; // Attach user information to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized2' });
  }
};

module.exports = authMiddleware;
