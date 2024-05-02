const express = require("express")
const router = express.Router();
const conver = require('../controllers/converstationController')
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/create/:idUser1/:idUser2', conver.createConversation);
router.get('/list/:id', conver.getListConversations);



module.exports = router