var express = require('express');
var router = express.Router();
const controller = require("../controllers/challenge.controller");

const Challenge = require('../models/Challenge'); 

// Define the route for fetching challenge statistics
router.get('/statistics', controller.ChallengesStatics);

// Define the route for viewing challenge details by ID
router.get('/:id', controller.viewDetailschallenge);

module.exports = router;
