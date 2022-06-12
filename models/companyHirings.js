const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string" },
  placementcyclename: { type: "string", required: true },
  companyname: { type: "string", required: true },
  hiringflowname: { type: "string", required: "true" },
  rollnumber: { type: "string", required: true },
})

const companyhirings = mongoose.model("companyhirings", Schema)

module.exports = companyhirings
