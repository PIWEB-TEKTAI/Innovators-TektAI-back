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
router.post('/:challengeId/addTeamParticipationRequest/:teamId',authMiddleware,challengeController.addTeamParticipationRequest);

module.exports = router