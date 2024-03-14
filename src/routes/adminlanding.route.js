var express = require('express');
var router = express.Router();

const AboutUs = require('../models/aboutUs'); // Import your User model
const controller = require("../controllers/admin.controller");


router.get('/aboutus', controller.getaboutus); // Route to get about us content
router.put('/editaboutus', controller.updateaboutus); // Route to update about us content
router.post('/initialize-aboutus', controller.initializeAboutUs); // Route to initialize about us content

router.get('/whyus', controller.getwhyus); // Route to get about us content
router.put('/editwhyus', controller.updatewhyus); // Route to update about us content
router.post('/initialize-whyus', controller.initializewhyUs); // Route to initialize about us content
router.post('/addwhyus', controller.addWhyUsItem);
router.delete('/deletewhyus/:id', controller.deleteWhyUsItem);



module.exports = router;