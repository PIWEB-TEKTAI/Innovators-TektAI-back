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
  createdAccountUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  isAdminNotification: {
    type: Boolean,
    default: false 
  },
} , { timestamps: true }
);

module.exports = mongoose.model('Notifications', NotificationsSchema);