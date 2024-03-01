const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPassword/:id/:token', userController.resetPassword);

module.exports = router;
