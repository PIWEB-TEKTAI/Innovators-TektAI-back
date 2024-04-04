const Notification = require('../models/notifications');



const getAllNotificationsAdmin = async (req,res)=>{
    try {
        const notifications = await Notification.find({ isAdminNotification:true }).populate('createdAccountUserId').sort({ createdAt: -1 });
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
    getAllNotificationsAdmin
 }
 