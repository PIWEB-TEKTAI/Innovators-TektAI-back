const express = require("express")
const router = express.Router();
const messageController = require('../controllers/messageController')
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/send/:idUser1/:idUser2', messageController.sendMessage);
router.get('/list/get/:userId/:otherUserId', messageController.getMessages);
router.post('/send/team/:idUser1/:teamId', messageController.sendMessageTeam);
router.get('/list/get/team/:userId/:teamId', messageController.getMessagesTeam);

module.exports = router