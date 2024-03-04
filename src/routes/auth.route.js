const controller = require("../controllers/auth.controller");
var express = require('express');
const { verifyToken ,verifyAndDecodeToken, isAdmin, isSuperAdmin, isChallenger, isCompany } = require("../middlewares/authjwt");
const authMiddleware = require('../middlewares/authMiddleware');
var router = express.Router();
router.post("/signin", controller.signin);

router.get('/securedResource', authMiddleware, (req, res) => {
    const userId = req.user.id;
    res.json({ message: 'You are authenticated', userId: req.user.userId, role: req.user.role,userName: req.user.userName,occupation:req.user.occupation,email:req.user.email,imageUrl:req.user.imageUrl});
  });
  
router.post("/signout", controller.signout);
router.put("/deactivate", authMiddleware, controller.deactivateAccount);

module.exports = router;