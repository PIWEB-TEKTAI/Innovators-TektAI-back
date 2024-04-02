const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Champ _id automatiquement généré
  title: String,
  description: String,
  price: String,
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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  targetedSkills: [String],
  dataset: [{
    name: String,
    description: String,
    fileUrl: String,
  }],
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
