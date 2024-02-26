const controller = require("../controllers/user.controller");
var express = require('express');
const { verifyToken ,verifyAndDecodeToken, isAdmin, isSuperAdmin, isChallenger, isCompany } = require("../middlewares/authjwt");
const authMiddleware = require('../middlewares/authMiddleware');
var router = express.Router();

router.get('/profile', authMiddleware,controller.profile);
  
module.exports = router;