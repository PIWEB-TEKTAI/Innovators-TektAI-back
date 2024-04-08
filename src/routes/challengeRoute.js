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
module.exports = router