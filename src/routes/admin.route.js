var express = require('express');
var router = express.Router();
const User = require('../models/User'); // Import your User model

const controller = require("../controllers/admin.controller");
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/getUsersWithAccountSwitchRequest',controller.getUsersWithAccountSwitchRequest)
router.put('/acceptSwitchRequest/:id',controller.acceptSwitchRequest)



module.exports = router;