const Message = require('../models/message');

const { getSocketInstance } = require("../../socket");
const Converstation = require('../models/converstation');



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



const getMessages = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;
    
        const messages = await Message.find({
          $or: [
            { sender: userId, recipient: otherUserId },
            { sender: otherUserId, recipient: userId }
          ]
        }).sort({ createdAt: 1 }); 
         
        if(!messages && messages.length < 0){
            res.status(200).json("messages not found")
        }
    
        res.status(200).json(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
      }
}

module.exports = { sendMessage , getMessages};
