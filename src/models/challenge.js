const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: String,
  description:String,
  price:String,
  image: String,
  status: {
    type: String,
    enum: ['open', 'completed', 'archived'],
    default: 'open'
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
 
});

module.exports = mongoose.model('Challenge', ChallengeSchema);