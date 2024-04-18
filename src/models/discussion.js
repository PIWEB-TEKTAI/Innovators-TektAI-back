const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },


  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sendingDate: {
    type: Date,
    default: Date.now
  },
  answers: [{
    content: { type: String, required: true },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    replyDate: { type: Date, default: Date.now }
  }]
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
