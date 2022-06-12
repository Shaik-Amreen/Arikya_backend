const Notifications = require("../models/notifications")
const verifyToken = require("./verifyToken")

exports.notificationpost = (verifyToken, (req, res) => {

  Notifications.create(req.body, (err, docs) => {
    !err ? res.send({ message: "success" }) : res.send({ message: "error" })
  })
})

exports.notificationget = (verifyToken, async (req, res, next) => {

  const notifications = await Notifications.find({ organisation_id: req.body.organisation_id }).lean();
  (notifications || notifications.message != 'error') ? res.send(notifications.reverse()) : res.send({ message: "error" })
})
