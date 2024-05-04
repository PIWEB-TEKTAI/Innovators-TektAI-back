const express = require("express")
const challengeController = require('../controllers/challengeController')
const router = express.Router();
const multer = require('../middlewares/multerConfig2')
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/edit/:id',authMiddleware, multer,challengeController.editChallenge);
router.get('/get/:id',authMiddleware,challengeController.getChallengeById);
router.post('/add',authMiddleware, multer,challengeController.addChallenge);
router.get('/statistics', challengeController.ChallengesStatics);
router.get('/:id', challengeController.viewDetailschallenge);
router.post('/:challengeId/addSoloParticipationRequest',authMiddleware,challengeController.addSoloParticipationRequest);
router.get('/:challengeId/participations', challengeController.getAllParticipations);
router.put('/:challengeId/accept-participation/:userId', authMiddleware,challengeController.acceptParticipation);
router.put('/:challengeId/decline/participation/:userId', authMiddleware,challengeController.declineParticipation);
router.post('/:challengeId/addDiscussion', authMiddleware ,challengeController.addDiscussion);
router.get('/:challengeId/discussions', challengeController.getDiscussionByChallengeId);
router.post('/:discussionId/like' ,challengeController.likeDiscussion);
router.post('/:discussionId/unlike', challengeController.unlikeDiscussion);
router.post('/:discussionId/addReply', authMiddleware ,challengeController.addReplyToDiscussion);
router.delete('/:discussionId/delete', authMiddleware, challengeController.deleteDiscussion);
router.delete('/:discussionId/replies/:replyId/delete', authMiddleware, challengeController.deleteReply);
router.post('/:challengeId/addTeamParticipationRequest/:teamId',authMiddleware,challengeController.addTeamParticipationRequest);
router.get('/team/:teamId', challengeController.getChallengesByTeam);
router.get('/:challengeId/participations/:type', challengeController.getFilteredParticipationsByType);

router.put('/:challengeTitle/acceptParticipationtitle/:userId' , challengeController.acceptParticipationtitle);
router.put('/:challengeTitle/declineParticipationtitle/:userId',challengeController.declineParticipationtitle);


module.exports = router