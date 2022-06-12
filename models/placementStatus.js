const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string" },
  rollnumber: { type: "string" },
  placementcyclename: { type: "string" },
  companyname: { type: "string" },
  companylocation: { type: "string" },
  mail: { type: "string" },
  registered: { type: "string" },
  placed: { type: "string" },
  placeddate: { type: "string" },
  package: { type: "string" },
  date: { type: "string" },
  token: { type: "string" },
  offerletter: { type: "string" },
  offerstatus: { type: "string" },
  offerdate: { type: "string" },
  verifiedoffer: { type: "string" },
  type: { type: "string" },
  placementcode: { type: "string" },
  companycode: { type: "string" },
  rejectedat: { type: "string" },
  eligible: { type: "Boolean" }
})
Schema.index(
  { rollnumber: 1, companyname: 1, placementcyclename: 1 },
  { unique: true }
)
const placementstatus = mongoose.model("placementstatus", Schema)

module.exports = placementstatus
