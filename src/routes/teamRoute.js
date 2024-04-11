const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware,teamController.createTeam);

router.post('/:teamId/join',authMiddleware, teamController.joinTeamRequest);

router.put('/:teamId/accept/:userId', teamController.acceptJoinRequest);

router.put('/:teamId/decline/:userId', teamController.declineJoinRequest);

module.exports = router;
