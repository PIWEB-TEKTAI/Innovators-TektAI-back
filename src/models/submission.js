const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  submittedByTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  output: {
    type: String,
  },
  datasetFile:{
    name:String,
    url:String
  },
  presentationFile:{
    name:String,
    url:String
  },
  codeSourceFile:{
    name:String,
    url:String
  },
  reportFile:{
    name:String,
    url:String
  },
  demoFile:{
    name:String,
    url:String
  },
  readMeFile:{
    name:String,
    url:String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    default: 0 // Assuming the default score is 0
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);