const express = require('express');
const router = express.Router();
const user = require('../controllers/user')
// Forgot password route
router.post('/forgotPassword', user.forgotPassword);

// Reset password route
router.post('/resetPassword/:id/:token', user.resetPassword);

module.exports = router;
