const User = require('../models/User');
const resetemail = require('../utils/resetemail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send({ Status: "User not existed" });
    }
    const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1h" });
    const resetPasswordLink = `http://localhost:5173/auth/resetPassword/${user._id}/${token}`;
    const template = 'emailresetpassword';
    resetemail(user.email, 'Reset Password Link', template , resetPasswordLink, user.FirstName, user.LastName)
      .then(() => res.send({ Status: "Success" }))
      .catch(error => res.status(500).json({ Status: "Error sending email", error }));
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ Status: "Internal Server Error" });
  }
};


exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, "jwt_secret_key");

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ Status: "User not found" });
    }

    // Check if the new password matches any of the user's previous passwords
    const passwordMatched = await Promise.all(user.previousPasswords.map(async (prevPassword) => {
      return await bcrypt.compare(password, prevPassword);
    }));

    if (passwordMatched.some(match => match)) {
      return res.status(400).json({ Status: "Cannot reuse previous password, Please try another one" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new password and update the previous passwords list
    user.previousPasswords.push(user.password);
    user.password = hashedPassword;
    await user.save();

    return res.json({ Status: "Success" });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ Status: "Internal Server Error" });
  }
};
