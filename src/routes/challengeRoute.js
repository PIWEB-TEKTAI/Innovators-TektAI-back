const express = require("express")
const challengeController = require('../controllers/challengeController')
const router = express.Router();
const multer = require('../middlewares/multerConfig2')


router.put('/edit/:id', multer,challengeController.editChallenge);
router.get('/get/:id',challengeController.getChallenge);



module.exports = router