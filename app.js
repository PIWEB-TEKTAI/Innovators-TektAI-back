const express = require('express');
const connectDB = require('./src/configs/db');
const cors = require('cors'); // Import the cors package
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./src/models/User'); // Import the User model
const forgotPasswordRoute = require('./src/routes/forgotPassword'); // Import the route for password reset

dotenv.config();

const app = express();
const server = require('http').createServer(app);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' , // Replace with your React app's URL
  credentials: true
}));
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/forgotPassword', (req, res) => {
  const {email} = req.body;
  User.findOne({email: email})
  .then(user => {
      if(!user) {
          return res.send({Status: "User not existed"})
      } 
      const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'gestionstockapii@gmail.com',
            pass: 'dhxo jaxk ewnv xsyr'
          }
        });
        const resetPasswordLink = `http://localhost:5173/auth/resetPassword/${user._id}/${token}`;
        var mailOptions = {
          from: 'gestionstockapii@gmail.com',
          to: user.email ,
          subject: 'Reset Password Link',
          text: resetPasswordLink
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            return res.send({Status: "Success"})
          }
        });
  })
})

app.post('/api/resetPassword/:id/:token', (req, res) => {
  const {id, token} = req.params
  const {password} = req.body

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if(err) {
          return res.json({Status: "Error with token"})
      } else {
          bcrypt.hash(password, 10)
          .then(hash => {
              User.findByIdAndUpdate({_id: id}, {password: hash})
              .then(u => res.send({Status: "Success"}))
              .catch(err => res.send({Status: err}))
          })
          .catch(err => res.send({Status: err}))
      }
  })
})


// Default route
app.use('', async function (req, res) {
  res.json({ message: "la réponse du serveur" });
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
