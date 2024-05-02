const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/',authMiddleware,teamController.createTeam);

router.post('/:teamId/join',authMiddleware, teamController.joinTeamRequest);

router.put('/:teamId/accept/:userId', teamController.acceptJoinRequest);

router.put('/:teamId/decline/:userId', teamController.declineJoinRequest);
router.get('/all', teamController.getAllTeams);
router.get('/front/all',authMiddleware, teamController.getAllTeamsPublic);
router.get('/myTeams',authMiddleware, teamController.getMyTeams);

router.get('/:id', teamController.getTeamById);
router.get('/challenger/invitations',authMiddleware, teamController.getInvitationsForChallenger);
router.put('/:teamId/accept-invitation',authMiddleware, teamController.acceptJoinInvitation);
router.put('/edit/:teamId',authMiddleware, teamController.editTeam);
router.delete('/:teamId', authMiddleware,teamController.deleteTeam);
router.put('/invite-members', teamController.inviteMembers);
router.get('/:teamId/requests', authMiddleware, teamController.getJoinRequests);
router.get('/find-by-leader/:leaderId', teamController.findTeamByLeader);

// Route to decline invitation
router.put('/:teamId/decline-invitation', authMiddleware,teamController.declineJoinInvitation);
module.exports = router;
