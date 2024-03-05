const jwt = require('jsonwebtoken');
const config = require('../configs/auth.config');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized1' });
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    req.userId = decoded.id; // Set userId based on the decoded token
    req.user = decoded; // Attach user information to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized2' });
  }
};

module.exports = authMiddleware;
