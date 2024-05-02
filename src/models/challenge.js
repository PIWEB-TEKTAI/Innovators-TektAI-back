const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: String,

  description:String,

  problematic:String,

  amount:String,

  visibility:String,

  status: {
    type: String,
    enum: ['open', 'completed', 'archived'],
    default: 'open' // You can set a default value if needed
  },
  startDate: {
    type: Date,
    required:true
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
  
  fileUrl:String,
  

  rankingMode: {
    automated:Boolean,
    expert:Boolean,
  },

  numberParticipants:{
      nbrTeam:String,
      nbrSolo:String
  },

  bareme: {
    output:Boolean,
    presentation:Boolean,
    codeSource:Boolean,
    dataSet:Boolean,
    readmeFile:Boolean,
    rapport:Boolean,
    Demo:Boolean
  },


  prizes:{
     prizeName:String,
     prizeDescription:String
  },

  recruitement:{
     positionTitle:String,
     jobDescription:String
  },
  
  freelance:{
    projectTitle:String,
    projectDescription:String
 },

  internship:{
    internshipTitle:String,
    internshipDescription:String,
    duration:String
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