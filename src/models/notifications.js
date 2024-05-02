const mongoose = require('mongoose');

const NotificationsSchema = new mongoose.Schema({

  title:{
   type:String,
   required:true
  },  
  content:{
    type:String,
    required:true
  }, 
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  UserConcernedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  TeamConcernedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team' 
  },
  ChallengeConcernedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge' 
  },
  SubmittionConcernedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission' 
  }, 
  TeamInvitation: {
    type: Boolean,
    default: false 
  },
  isAdminNotification: {
    type: Boolean,
    default: false 
  },
} , { timestamps: true }
);

module.exports = mongoose.model('Notifications', NotificationsSchema);