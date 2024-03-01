const controller = require("../controllers/user.controller");
var express = require('express');
const { verifyToken ,verifyAndDecodeToken, isAdmin, isSuperAdmin, isChallenger, isCompany } = require("../middlewares/authjwt");
const authMiddleware = require('../middlewares/authMiddleware');
var router = express.Router();
const multer = require('../middlewares/multer.config')

router.get('/profile', authMiddleware,controller.profile);
router.post('/imageUpload', authMiddleware,multer, controller.imageUpload)
router.put('/updateProfile',authMiddleware,controller.updatedUser);
router.post('/checkEmailUnique',authMiddleware,controller.checkEmailUnique)
router.put('/updateCompany',authMiddleware,controller.updateCompany)

module.exports = router;