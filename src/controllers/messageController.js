const Message = require('../models/message');

const { getSocketInstance } = require("../../socket");
const Converstation = require('../models/converstation');
const Team = require('../models/team');



const sendMessage = async (req, res) => {
  try {
    const io = getSocketInstance();

    const userId1 = req.params.idUser1;
    const userId2 = req.params.idUser2;

    const { text } = req.body; 

    const message = new Message({ sender:userId1 , recipient:userId2 , content:text });

    await message.save();

    const conversation = await Converstation.findOneAndUpdate(
        { participants: { $all: [userId1, userId2] } },
        { $push: { messages: message._id } }, 
        { new: true } 
      );
  

    await io.emit("message", {
        idSender: userId1,
        idRecipient: userId2,
        content: text,
      });

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};




const sendMessageTeam = async (req, res) => {
  try {
    const io = getSocketInstance();

    const userId1 = req.params.idUser1;
    const teamId = req.params.teamId;

    const { text } = req.body; 

    const message = new Message({ sender:userId1 , recipient:teamId , content:text });

    await message.save();

    const conversation = await Converstation.findOneAndUpdate(
        { participants: { $all: [userId1] } , team:teamId },
        { $push: { messages: message._id } }, 
        { new: true } 
      );
    
    const team = await Team.findById(teamId);  

    const recipients = [...team.members, team.leader];

    await Promise.all(recipients.map(async (recipientId) => {
      await io.emit("messageTeam", {
        idSender: userId1,
        idRecipient: recipientId,
        content: text,
      });
    }));

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};


const getMessages = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;
    
        const messages = await Message.find({
          $or: [
            { sender: userId, recipient: otherUserId },
            { sender: otherUserId, recipient: userId }
          ]
        }).sort({ createdAt: 1 }); 
         
        if(!messages && messages.length === 0){
            res.status(200).json("messages not found")
        }
    
        res.status(200).json(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
      }
}



const getMessagesTeam = async (req, res) => {
  try {
    const { userId, teamId } = req.params;
    
    const isUserInTeam = await Team.findOne({ 
      _id: teamId, 
      $or: [
          { members: userId },
          { leader: userId }
      ]
  });
    if (!isUserInTeam) {
      return res.status(403).json({ message: "User is not a member of the team" });
    }

    const messages = await Message.find({ recipient: teamId }).populate('sender').sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { sendMessage , getMessages , sendMessageTeam , getMessagesTeam};
