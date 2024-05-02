const Converstation = require('../models/converstation');
const Conversation = require('../models/converstation');




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

      const conversations = await Conversation.find({ participants: { $in: [userId] }}).populate(
        'participants'
      );
    
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


module.exports = {
  createConversation,
  getListConversations
};