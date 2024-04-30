const mongoose = require('mongoose');
const imageUrls = [
  'http://localhost:3000/images/travail-en-equipe.png',
  'http://localhost:3000/images/idee.png',
  'http://localhost:3000/images/gens.png',
  'http://localhost:3000/images/developpeurs.png',

];

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: { 
    type: String,
    default: function() {
      return imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
