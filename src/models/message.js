const mongoose = require('mongoose');
const ChatroomSchema = require('./chatroom');


const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
   
  },
  senderId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'

  },

 message :{
    type:String , 
   
 }


});

const MsgSchema = mongoose.model('Message', messageSchema);

module.exports = MsgSchema;