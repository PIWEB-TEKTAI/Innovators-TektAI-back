
const mongoose = require('mongoose');
const Chatroom = require('../models/chatroom');
const Users = require("../models/User");
const Message = require("../models/message");
const User = require('../models/User');


/*exports.createChatroom= async(req,res)=>{

    const {name} = req.body; 

    const nameRegex = /^[A-Za-z\$]+$/;

    if(!nameRegex.test(name)) throw "Chatroom name can contain only alphabets ."; 
    const chatroomExists=await Chatroom.findOne({name});
    if (chatroomExists) throw " chatroom with that nae already exists";

    const chatroom = new Chatroom({
name,

    });
//https://www.youtube.com/watch?v=7dqxzFnu33g&list=PLSQi9CtBDLnNqmKdT7yiDUzzfbYDS4oLd
    await chatroom.save();
    res.json({message:"chatroom creaded"})

   
    
}*/

exports.createChatroom= async(req,res)=>{

   try{
      const {senderId,receiverId} = req.body;
      const newConversation = new Chatroom({members : [senderId,receiverId]})
      await newConversation.save();
      res.status(200).send('chatroom created')
   }catch(error)
   {

    console.log(error,"error");
   }
   
    
}
exports.getAllUsers=async(req,res)=>{
   try{
      const userId=req.params.userId;
      const users = await User.find({_id:{$ne: userId}});
      const usersData=Promise.all(users.map(async (user)=>{
         return {user : {email:user.email, firstname:user.FirstName,lastname:user.LastName,image:user.imageUrl},userId:user._id}

      }));
      res.status(200).json(await usersData);

   }catch(error)
   {
      console.log(error)
   }
}


exports.getchatroomById= async(req,res)=>{

    try{
      const User=req.params.userId
      const chatroom = await Chatroom.find({members:{$in:[User]}});
      const conservationData= Promise.all(chatroom.map(async (conversation)=>{
        const receiverId= await conversation.members.find((member)=>member !==User);
        const user= await Users.findById(receiverId);
        return {user:{id:user._id,email:user.email,firstname:user.FirstName,lastname:user.LastName,image:user.imageUrl},chatroomId:conversation._id}
      }));

      res.status(200).json(await conservationData)
     
    }catch(error)
    {
 
     console.log(error,"error");
    }
    
     
 }

 exports.createMessage = async (req, res) => {
   try {
       const { conversationId, senderId, message, receiverId } = req.params;
       if (!senderId || !message) {
           return res.status(400).send('SenderId and message are required');
       }

       if (conversationId) {
           // Vérifier si la conversationId existe déjà
           const existingConversation = await Chatroom.findById(conversationId);
           if (existingConversation) {
               // Ajouter un nouveau message à la conversation existante
               const newMessage = new Message({ conversationId, senderId, message });
               await newMessage.save();

               return res.status(200).send('Message added to existing conversation');
           }
       }

       // Si la conversationId n'existe pas ou n'est pas fournie, créer une nouvelle conversation
       if (receiverId) {
           const newConversation = new Chatroom({ members: [senderId, receiverId] });
           await newConversation.save();

           const newMessage = new Message({ conversationId: newConversation._id, senderId, message });
           await newMessage.save();

           return res.status(200).send('Message sent successfully to new conversation');
       }

       res.status(400).send('ReceiverId is required for a new conversation');
   } catch (error) {
       console.log(error, "error");
       res.status(500).send('Internal Server Error');
   }
};

 exports.getMessage= async(req,res)=>{

    try{
      const conversationId=req.params.conversationId
      if(!conversationId ==='new') return res.status(200).send('ConversationId is required');
      const message = await Message.find({conversationId});
      const MessageData= Promise.all(message.map(async (msg)=>{
        const user= await Users.findById(msg.senderId);
        return {user:{ id:user._id,email:user.email,firstname:user.FirstName,lastname:user.LastName},message:msg.message}
      }));

      res.status(200).json( await MessageData)
     
    }catch(error)
    {
 
     console.log(error,"error");
    }
    
     
 }

exports.getReceiverUserBySenderIdAndconversationId = async (req, res) => {
    try {
        const { senderId, conversationId } = req.params;
        if (!senderId || !conversationId) {
            return res.status(400).send('SenderId and conversationId are required');
        }

        // Récupérer la conversation en fonction de l'identifiant
        const conversation = await Chatroom.findById(conversationId);
        if (!conversation) {
            return res.status(404).send('Conversation not found');
        }

        // Vérifier si l'expéditeur est membre de la conversation
        if (!conversation.members.includes(senderId)) {
            return res.status(403).send('Sender is not a member of this conversation');
        }

        // Trouver l'ID du destinataire en excluant l'expéditeur
        const receiverId = conversation.members.find(memberId => memberId !== senderId);

        // Récupérer les informations sur le destinataire à partir de son ID
        const receiverUser = await Users.findById(receiverId);
        if (!receiverUser) {
            return res.status(404).send('Receiver user not found');
        }

        res.status(200).json({
            id: receiverUser._id,
            email: receiverUser.email,
            firstname: receiverUser.FirstName,
            lastname: receiverUser.LastName,
            image:receiverUser.imageUrl
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


exports.getconversetionIdBysenderandReceiverId = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Rechercher la conversation qui correspond à l'expéditeur et au destinataire
        const conversation = await Chatroom.findOne({
            members: { $all: [senderId, receiverId] } // $all pour vérifier que les membres contiennent à la fois l'expéditeur et le destinataire
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.status(200).json({ conversationId: conversation._id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

