const Converstation = require('../models/converstation');
const Message = require('../models/message');




const createConversation = async (req,res) => {

    const userId1 = req.params.idUser1;
    const userId2 = req.params.idUser2;
  try {
    const existingConverstation = await Converstation.findOne({
      participants: { $all: [userId1, userId2] }
    });

    if (existingConverstation) {
        res.status(200).json({existingConverstation});
    }else{
        const newConverstation = await Converstation.create({
        participants: [userId1, userId2]
        });

        res.status(200).json({newConverstation});
  }
  } catch (error) {
    throw new Error('Error creating conversation: ' + error.message);
  }
};


const getListConversations = async (req, res) => {
    try {
      const userId= req.params.id  

      const conversations = await Converstation.find({ participants: { $in: [userId] }}).populate(
        'participants'
      ).populate('messages').populate('team');
    
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };



const DeleteConverstation = async (req, res) => {
    const id = req.params.id;
  
    try {
     
      const deletedConversation = await Converstation.findByIdAndDelete(id);

      if (!deletedConversation) {
         return res.status(404).json({ message: "Conversation not found" });
      }

      await Message.deleteMany({ _id: { $in: deletedConversation.messages } });
 
      res.status(201).json({ msg: "Converstation deleted successfully" });
    } catch (error) {
      console.error("Error deleting Converstation :", error);
      res
        .status(500)
        .json({ msg: "An error occurred while deleting Converstation" });
    }
  };

module.exports = {
  createConversation,
  getListConversations,
  DeleteConverstation
};