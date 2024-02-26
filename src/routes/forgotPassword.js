// forgotPassword.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');

// POST route to handle password reset request
router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // TODO: Send the password reset link with the token to the user's email

    res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    console.error('Error sending password reset link:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
