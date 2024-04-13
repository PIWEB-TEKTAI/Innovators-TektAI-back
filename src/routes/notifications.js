const express = require("express")
const notif = require('../controllers/notifications')
const router = express.Router();


router.get('/list', notif.getAllNotificationsAdmin);
router.get('/list/user', notif.getAllNotificationsUser);



module.exports = router