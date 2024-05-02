const mongoose = require('mongoose');


const chatroomSchema = new mongoose.Schema({
  members: {
    type: Array,
    required: true,
   
  },
})
const ChatroomSchema = mongoose.model('Chatroom', chatroomSchema);

module.exports = ChatroomSchema;