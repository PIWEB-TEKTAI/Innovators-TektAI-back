const express = require("express")
const challengeController = require('../controllers/challengeController')
const router = express.Router();
const multer = require('../middlewares/multerConfig2')
const authMiddleware = require('../middlewares/authMiddleware');


router.put('/edit/:id',authMiddleware, multer,challengeController.editChallenge);
router.get('/get/:id',authMiddleware,challengeController.getChallenge);
router.post('/add',authMiddleware, multer,challengeController.addChallenge);
router.get('/statistics', challengeController.ChallengesStatics);
router.get('/:id', challengeController.viewDetailschallenge);
router.post('/:challengeId/addDiscussion', challengeController.addDiscussion);
router.get('/:challengeId/discussions', challengeController.getDiscussionByChallengeId);
router.post('/:discussionId/like', challengeController.likeDiscussion);
router.post('/:discussionId/unlike', challengeController.unlikeDiscussion);
router.post('/:discussionId/addReply', challengeController.addReplyToDiscussion);
router.delete('/:discussionId/delete', authMiddleware, challengeController.deleteDiscussion);
router.delete('/:discussionId/replies/:replyId/delete', authMiddleware, challengeController.deleteReply);

module.exports = router