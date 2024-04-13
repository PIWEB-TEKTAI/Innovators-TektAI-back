const Notification = require('../models/notifications');



const getAllNotificationsAdmin = async (req,res)=>{
    try {
        const notifications = await Notification.find({ isAdminNotification:true }).populate('UserConcernedId').sort({ createdAt: -1 });
        console.log(notifications)
        if (!notifications || notifications.length === 0) {
          return res.status(404).json({ message: 'Aucun notifications trouvé' });
        }
        res.status(200).json({notifications});
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
}



const getAllNotificationsUser = async (req,res)=>{
  try {

      const userId = req.user.id
      console.log(userId)
      const notifications = await Notification.find({ recipientUserId:userId  }).populate('UserConcernedId').sort({ createdAt: -1 });
      console.log(notifications)
      if (!notifications || notifications.length === 0) {
        return res.status(404).json({ message: 'Aucun notifications trouvé' });
      }
      res.status(200).json({notifications});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
}




module.exports = {
    getAllNotificationsAdmin,
    getAllNotificationsUser
 }
 