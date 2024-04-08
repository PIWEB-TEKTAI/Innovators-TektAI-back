const jwt = require('jsonwebtoken');
const config = require('../configs/auth.config');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized1' });
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    req.userId = decoded.id; 
    req.user = decoded; 
    console.log("date"+new Date()+"exp"+new Date(decoded.exp*1000))
    if ( new Date()>new Date(decoded.exp*1000)) {
      res.clearCookie('token');
      return res.status(401).json({ message: 'Token expired' });
    }  
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized2' });
  }
};

module.exports = authMiddleware;
