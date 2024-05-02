const express = require("express")
const notifChat = require('../controllers/chatroom')
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

router.post('/addchatroom', notifChat.createChatroom);
router.get('/getusers/:userId', notifChat.getAllUsers);
router.get('/getchatroomById/:userId', notifChat.getchatroomById);
router.post('/addMessage/:senderId/:receiverId/:conversationId/:message', notifChat.createMessage);
router.get('/getMessage/:conversationId', notifChat.getMessage);
router.get('/getReceiverUserBySenderIdAndconversationId/:conversationId/:senderId', notifChat.getReceiverUserBySenderIdAndconversationId);
router.get('/getconversetionIdBysenderandReceiverId/:senderId/:receiverId',notifChat.getconversetionIdBysenderandReceiverId)




module.exports = router