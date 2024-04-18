const Team = require('../models/team');

exports.createTeam = async (req, res) => {
    try {
      const { name, selectedChallengers } = req.body;
      const leader = req.userId; // Assuming the middleware sets the user ID in req.userId
  
      const existingTeam = await Team.findOne({ leader });
      if (existingTeam) {
        return res.status(400).json({ message: 'You have already created another team. You can only create one team as a leader' });
      }
   
      const team = new Team({ name, invitations: selectedChallengers,leader });
      await team.save();
      res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
      console.error('Error creating team:', error);
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



exports.getAllTeamsPulic = async (req, res) => {
  try {
    const teams = await Team.find({private:false}).populate('members').populate('invitations');
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Internal server error' });
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