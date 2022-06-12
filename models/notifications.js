const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  date: { type: "string", required: true },
  reason: { type: "string", required: true },
  organisation_id: { type: "string" },
  doneby: { type: "string" },
  firstname: { type: "string" },
  placementcyclename: { type: "string" },
  companyname: { type: "string" },
})
const Notifications = mongoose.model("Notifications", Schema)

module.exports = Notifications
