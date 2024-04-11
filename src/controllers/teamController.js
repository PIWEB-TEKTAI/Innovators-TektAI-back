const Team = require('../models/team');

exports.createTeam = async (req, res) => {
    try {
      const { name } = req.body;
      const leader = req.userId; // Assuming the middleware sets the user ID in req.userId
  
      const existingTeam = await Team.findOne({ leader });
      if (existingTeam) {
        return res.status(400).json({ message: 'You are already a leader of another team' });
      }
  
      const team = new Team({ name, leader });
      await team.save();
      res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
      console.error('Error creating team:', error);
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
    console.error('Error sending join team request:', error);
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