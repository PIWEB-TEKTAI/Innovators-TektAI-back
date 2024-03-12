const express = require("express")
const user = require('../controllers/user')
const router = express.Router();

const controller = require("../controllers/user.controller");
const { verifyToken ,verifyAndDecodeToken, isAdmin, isSuperAdmin, isChallenger, isCompany } = require("../middlewares/authjwt");
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('../middlewares/multer.config')

router.post('/register', user.register);
router.post('/EmailVerification/:token/:id',user.emailVerification);
router.post('/resendEmail',user.resendEmailVerification);
router.get('/profile', authMiddleware,controller.profile);
router.post('/imageUpload', authMiddleware,multer, controller.imageUpload)
router.put('/updateProfile',authMiddleware,controller.updatedUser);
router.post('/checkEmailUnique',authMiddleware,controller.checkEmailUnique)
router.put('/updateCompany',authMiddleware,controller.updateCompany)




router.post('/forgotPassword', user.forgotPassword);
router.post('/resetPassword/:id/:token', user.resetPassword);
router.post('/contact', user.sendContactEmail);


module.exports = router
