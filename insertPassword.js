const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/user'); // Adjust the path based on your project structure

const passwordToHash = 'rouaida123'; // The password you want to hash

// Connect to MongoDB with an increased timeout
mongoose.connect("mongodb://localhost:27017/tektai", { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 30000 });

// Generate a salt
const saltRounds = 10;
bcrypt.genSalt(saltRounds, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    process.exit(1);
  }

  // Hash the password with the generated salt
  bcrypt.hash(passwordToHash, salt, async (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      process.exit(1);
    }

    try {
      // Insert the user with the hashed password into the database
      await User.create({
        email: 'rouaidabenrabeh@gmail.com', // Adjust based on your user schema
        password: hashedPassword,
        role: 'company',
        FirstName:'wissem',
        LastName:'ben foulen',
        occupation:'project Manager',
        company:{
          name:'smart2s',
          email:'smart2s@gmail.com',
          
        }


      });

      console.log('User with hashed password inserted successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error inserting user:', error);
      process.exit(1);
    }
  });
});
