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
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  files: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);