const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: { 
    type: String,
    default:"http://localhost:3000/images/transparent-management-icon-team-icon-5e143fb74b04b0.8063195515783853353073.jpg"
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  private: {
    type: Boolean,
    default: false 
  },
  
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
