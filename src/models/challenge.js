const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
 _id : mongoose.Schema.Types.ObjectId,
  title: String,
  description:String,
  price:String,
  status: {
    type: String,
    enum: ['open', 'completed', 'archived'],
    default: 'open' // You can set a default value if needed
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetedSkills: [String], 
  dataset: {
    name: String,
    description: String,
    fileUrl:String,

  },
  image:String,
  participations: {
    soloParticipants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    soloParticipationRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    TeamParticipants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }],
    TeamParticipationRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }]
  } 
});



module.exports = mongoose.model('Challenge', ChallengeSchema);