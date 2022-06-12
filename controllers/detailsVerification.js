const Studentdata = require("../models/studentData")
const Notifications = require("../models/detailsVerification")
const verifyToken = require("./verifyToken")
const manageData = require("./manageData")

exports.notificationpost = (verifyToken, async (req, res) => {

  req.body.forEach(async (e, i) => {
    await Notifications.create(e, (err, docs) => {
      !err && i == req.body.length - 1 ? res.send({ message: "success" }) : i == req.body.length - 1 ? res.send({ message: "error" }) : null
    })
  })
})

exports.notificationget = (verifyToken, async (req, res) => {

  const notifications = await Notifications.find({ organisation_id: req.body.organisation_id }).lean();
  // console.log("notifications",notifications);
  (notifications || notifications.message != 'error') ? res.send(notifications.reverse()) : res.send({ message: "error" })
})

exports.notificationupdate = (verifyToken, async (req, res) => {

  doc1 = await manageData.updateDetailsVerification("updateOne", { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber, current: req.body.current, date: req.body.date, field: req.body.field }, req.body);
  (doc1 && doc1.message != "error" && req.body.verified == 'rejected') ? (
    docs1 = await manageData.getDetailsVerification("findOne", { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber, field: req.body.field, date: req.body.date })
    , (docs1 && docs1.message != "error") && (
      docs2 = await manageData.updateStudentData("updateOne", { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { [docs1.field]: docs1.current })
      , (docs2 || docs2.message != "error") ? res.send({ message: "success" }) : console.log("error while retriving all records:", JSON.stringify(err, undefined, 2))
    )
  ) : res.send({ message: "error" })
})
