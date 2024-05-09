const Team = require('../models/team');
const Notification = require('../models/notifications');
const { getSocketInstance } = require('../../socket');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Converstation  = require('../models/converstation');

const teamInvitationMail = require('../utils/teamInvitationMail');
require('dotenv').config();

exports.createTeam = async (req, res) => {
  try {
    const { name, selectedChallengers, private, emailInvitation } = req.body;
    const io = getSocketInstance();
    const leader = req.userId; // Assuming the middleware sets the user ID in req.userId

    const existingTeam = await Team.findOne({ leader });
    if (existingTeam) {
      return res.status(400).json({ message: 'You have already created another team. You can only create one team as a leader' });
    }

    const team = new Team({ name, invitations: selectedChallengers, leader, private, emailInvitations: emailInvitation });
    await team.save();

    if (!team) {
      return res.status(500).json({ error: 'Team creation failed' });
    }
    
    const conversation = new Converstation({
      participants: [...selectedChallengers,team.leader], 
      team: team._id
    });
    
    await conversation.save();

    const leaderChallenger = await User.findById(leader);

    // Array to store all the email invitation promises
    const emailPromises = emailInvitation.map(async (email) => {
      const teamLink = `http://localhost:5173/teams/myInvitations`;
      const template = 'TeamInvitation';
      return teamInvitationMail(email, 'Invitation to Join '+team.name+" team", template, teamLink, team.name, leaderChallenger.FirstName +" "+ leaderChallenger.LastName);
    });

    // Wait for all email invitation promises to resolve
    await Promise.all(emailPromises);

    for (const challengerId of selectedChallengers) {
      await io.emit("addInvitationRequest", { firstname: leaderChallenger.FirstName, lastname: leaderChallenger.LastName, idUser: challengerId, content: `has sent you an invitation to join ${name}` });
      await Notification.create({
          title: "Invitation added",
          content: `has sent you an invitation to join ${name}`,
          recipientUserId: challengerId,
          UserConcernedId: leaderChallenger._id,
          TeamInvitation:true,
          isAdminNotification: false
      });
    }

 

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  // Function to invite members by link
exports.inviteByLink= async (req, res) => {
    const { teamId } = req.params;
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Generate the invitation link
      const invitationLink = generateInvitationLink(teamId); // Implement this function

      
      res.status(200).json({ invitationLink });
    } catch (error) {
      console.error('Error inviting members by link:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
exports.handleInvitationLink= async (req, res) => {
  const userId = req.userId;
  try {
    const token = req.params.token;

    const decodedToken = jwt.verify(token,"jwt_secret_key");
    if (!decodedToken) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const teamId = decodedToken.teamId;
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if(team.invitations.includes(userId)){
      return res.json({ redirectTo: '/teams/myInvitations' });

    }
    team.invitations.push(userId); // Add user to the team members
    await team.save();

    res.json({ redirectTo: '/teams/myInvitations' });
  } catch (error) {
    console.error('Error handling invitation link:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const generateInvitationLink = (teamId) => {
  const payload = {
    teamId: teamId
  };

  const token = jwt.sign(payload, "jwt_secret_key");

  const invitationLink = `http://localhost:5173/team/linkInvitation/${token}`;

  return invitationLink;
};

exports.inviteMembers = async (req, res) => {
  try {
    const { teamId, userIds, emailInvitations } = req.body;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $addToSet: { invitations: { $each: userIds }, emailInvitations } },
      { new: true }
    ).populate('leader');

    // Array to store all the email invitation promises
    const emailPromises = emailInvitations.map(async (email) => {
      const teamLink = `http://localhost:5173/teams/myInvitations`;
      const template = 'TeamInvitation';
      return teamInvitationMail(email, 'Invitation to Join '+team.name+" team", template, teamLink, team.name, team.leader.FirstName +" "+ team.leader.LastName);
    });
    await Promise.all(emailPromises);

    res.json({ success: true, team });
  } catch (error) {
    console.error('Error inviting members:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.editTeam = async (req, res) => {
  try {
    const { name, selectedChallengers } = req.body;
    const isPrivate = req.body.isprivate;
    const { teamId } = req.params;

    const updatedTeam = await Team.findById(teamId);

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Filter out selected challengers who are already members
    const newInvitations = selectedChallengers.filter(challenger =>
      !updatedTeam.members.some(member => member._id === challenger._id)
    );

    // Update the team with the new details
    updatedTeam.name = name;
    updatedTeam.invitations = newInvitations;
    updatedTeam.private = isPrivate;

    // Save the updated team
    const savedTeam = await updatedTeam.save();

    res.status(200).json({ message: 'Team updated successfully', team: savedTeam });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('members').populate('invitations');

    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getAllTeamsPublic = async (req, res) => {
  try {
    const userId = req.user.id 

    const teams = await Team.find({private:false ,  $nor: [
      { leader: userId },
      { members: userId } 
    ]}).populate('members').populate('invitations');
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 


exports.getMyTeams = async (req, res) => {
  try {
    
    const userId = req.userId; 
    console.log(userId);
    const teams = await Team.find({
      $or: [
        { leader: userId }, 
        { members: { $in: [userId] } } 
      ]
    });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.findTeamByLeader = async (req, res) => {
  try {
    const { leaderId } = req.params;
    const team = await Team.findOne({ leader: leaderId }).populate('requests');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findById(id).populate('leader').populate('members').populate('invitations').populate('requests');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error fetching team by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.joinTeamRequest = async (req, res) => {
  try {
    const io = getSocketInstance();

    const { teamId } = req.params;
    const  userId  = req.userId;
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (team.requests.includes(userId)) {
      return res.status(400).json({ message: 'Request already exists' });
    }
    const challenger = await User.findById(userId);

    team.requests.push(userId);
    await team.save();

    await io.emit("joinTeamRequest", { firstname: challenger.FirstName, lastname: challenger.LastName, idUser: team.leader, content: `has sent you a request to join your team ${team.name}` });
      await Notification.create({
          title: "Request to join team",
          content: `has sent you a request to join your team ${team.name}`,
          recipientUserId: team.leader,
          UserConcernedId: challenger._id,
          TeamInvitation:true,
          isAdminNotification: false
      });

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getJoinRequests = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('requests');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json({ requests: team.requests });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.acceptJoinRequest = async (req, res) => {
  try {
    const io = getSocketInstance();

    const { teamId, userId } = req.params;
    console.log(req.params)
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (!team.requests.includes(userId)) {
      return res.status(400).json({ message: 'Request does not exist' });
    }

    const challenger = await User.findById(userId);
    // Add user to team members
    team.members.push(userId);
    // Remove user from requests
    team.requests = team.requests.filter(request => request.toString() !== userId);
    await team.save();

    await io.emit("acceptTeamRequest", { name:team.name, idUser: userId, content: `has accept your request to join their team`  });
    await Notification.create({
        title: "Request to join team",
        content: `has accept your request to join their team`,
        recipientUserId: userId,
        TeamConcernedId: team._id,
        TeamInvitation:true,
        isAdminNotification: false
    });

    res.status(200).json({ message: 'Request accepted successfully' });
  } catch (error) {
    console.error('Error accepting join team request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  exports.acceptJoinInvitation = async (req, res) => {
    try {
      const io = getSocketInstance();

      const teamId = req.params.teamId;
      const userId = req.userId;
  
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      if (!team.invitations.includes(userId)) {
        return res.status(400).json({ message: 'Invitation does not exist' });
      }
  
      // Add user to team members
      team.members.push(userId);
      // Remove user from invitations
      team.invitations = team.invitations.filter(invitation => invitation.toString() !== userId);

      const leaderChallenger = await User.findById(team.leader);
      const challenger = await User.findById(userId);
      await team.save();
    
      await io.emit("acceptInvitationRequest", { firstname: challenger.FirstName, lastname: challenger.LastName, idUser: leaderChallenger._id, content: `has accept your invitation to join ${team.name}` });
  
      await Notification.create({
          title: "Accept Invitation",
          content: `has accept your invitation to join ${team.name}`,
          recipientUserId: leaderChallenger._id,
          UserConcernedId: userId,
          isAdminNotification: false
      });
  
      res.status(200).json({ message: 'Invitation accepted successfully' });
    } catch (error) {
      console.error('Error accepting join team invitation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  exports.declineJoinInvitation = async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const userId = req.userId;
  
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      if (!team.invitations.includes(userId)) {
        return res.status(400).json({ message: 'Invitation does not exist' });
      }
  
      // Remove user from invitations
      team.invitations = team.invitations.filter(invitation => invitation.toString() !== userId);
      await team.save();
  
      res.status(200).json({ message: 'Invitation declined successfully' });
    } catch (error) {
      console.error('Error declining join team invitation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  exports.declineJoinRequest = async (req, res) => {
    try {
      const { teamId, userId } = req.params;
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      if (!team.requests.includes(userId)) {
        return res.status(400).json({ message: 'Request does not exist' });
      }
      // Remove user from requests
      team.requests = team.requests.filter(request => request.toString() !== userId);
      await team.save();
      res.status(200).json({ message: 'Request declined successfully' });
    } catch (error) {
      console.error('Error declining join team request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  exports.getInvitationsForChallenger = async (req, res) => {
    const challengerId = req.userId;
    
  
    try {
      const teamsWithInvitations = await Team.find({ invitations: challengerId });
  
      res.json(teamsWithInvitations);
    } catch (error) {
      console.error('Error retrieving invitations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.deleteTeam = async (req, res) => {
    try {
      const { teamId } = req.params;
      
      // Check if the team exists
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Check if the user making the request is authorized to delete the team
      // For example, you might want to check if the user is the leader of the team
      // This logic depends on your application's requirements and user roles
  
      // Delete the team
      await Team.findByIdAndDelete(teamId);
  
      res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
      console.error('Error deleting team:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  