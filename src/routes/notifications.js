const express = require("express")
const notif = require('../controllers/notifications')
const router = express.Router();


router.get('/list', notif.getAllNotificationsAdmin);



module.exports = router