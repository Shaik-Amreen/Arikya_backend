const express = require("express")
var router = express.Router()

const Notifications = require("../controllers/detailsVerification")
const Notificationsadmin = require("../controllers/notifications")

router.post("/postnotifications", Notifications.notificationpost)
router.post("/findnotifications", Notifications.notificationget)
router.post("/updatenotifications", Notifications.notificationupdate)

router.post("/postadminoti", Notificationsadmin.notificationpost)
router.post("/findadminoti", Notificationsadmin.notificationget)

module.exports = router
