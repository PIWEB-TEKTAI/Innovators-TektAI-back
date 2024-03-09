var express = require('express');
var router = express.Router();

const AboutUs = require('../models/aboutUs'); // Import your User model
const controller = require("../controllers/admin.controller");


router.get('/aboutus', controller.getaboutus); // Route to get about us content
router.put('/editaboutus', controller.updateaboutus); // Route to update about us content
router.post('/initialize-aboutus', controller.initializeAboutUs); // Route to initialize about us content


module.exports = router;