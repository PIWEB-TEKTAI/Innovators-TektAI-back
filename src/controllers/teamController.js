const Team = require('../models/team');

exports.createTeam = async (req, res) => {
    try {
      const { name, selectedChallengers,private } = req.body;
      const leader = req.userId; // Assuming the middleware sets the user ID in req.userId
  
      const existingTeam = await Team.findOne({ leader });
      if (existingTeam) {
        return res.status(400).json({ message: 'You have already created another team. You can only create one team as a leader' });
      }
   
      const team = new Team({ name, invitations: selectedChallengers,leader,private:private });
      await team.save();
      res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ error: 'Internal server error' });
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
    const teams = await Team.find({private:false}).populate('members').populate('invitations');

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
exports.getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findById(id).populate('leader').populate('members').populate('invitations');
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
    const { teamId } = req.params;
    const { userId } = req.body;
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (team.requests.includes(userId)) {
      return res.status(400).json({ message: 'Request already exists' });
    }
    team.requests.push(userId);
    await team.save();
    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.acceptJoinRequest = async (req, res) => {
    try {
      const { teamId, userId } = req.params;
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      if (!team.requests.includes(userId)) {
        return res.status(400).json({ message: 'Request does not exist' });
      }
      // Add user to team members
      team.members.push(userId);
      // Remove user from requests
      team.requests = team.requests.filter(request => request !== userId);
      await team.save();
      res.status(200).json({ message: 'Request accepted successfully' });
    } catch (error) {
      console.error('Error accepting join team request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  exports.acceptJoinInvitation = async (req, res) => {
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
  
      // Add user to team members
      team.members.push(userId);
      // Remove user from invitations
      team.invitations = team.invitations.filter(invitation => invitation.toString() !== userId);
      await team.save();
  
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
      team.requests = team.requests.filter(request => request !== userId);
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