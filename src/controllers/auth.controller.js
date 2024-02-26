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
  
      const token = jwt.sign(
        { id: user.id , role: user.role,userName:user.FirstName + " " + user.LastName,occupation:user.occupation,email:user.email},
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
exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

