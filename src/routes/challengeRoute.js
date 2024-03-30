const express = require("express")
const challengeController = require('../controllers/challengeController')
const router = express.Router();
const multer = require('../middlewares/multerConfig2')


router.post('/add', multer,challengeController.addChallenge);



module.exports = router