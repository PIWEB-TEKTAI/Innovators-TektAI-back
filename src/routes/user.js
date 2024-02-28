const express = require("express")
const router = express.Router();
const user = require('../controllers/user')

router.post('/register', user.register);
router.post('/EmailVerification/:token/:id',user.emailVerification);
router.post('/resendEmail',user.resendEmailVerification);





module.exports = router