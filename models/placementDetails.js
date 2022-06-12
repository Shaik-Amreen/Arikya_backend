const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string", required: true },
  placementcyclename: {
    type: "string",
    required: true,
    index: { unique: true, dropDups: true },
  },
  fromdate: { type: "string", required: true },
  todate: { type: "string", required: true },
  batch: { type: "Array", required: true },
  type: { type: "string", required: true },
  code: { type: "string" },
})
Schema.index({ organisation_id: 1, placementcyclename: 1 }, { unique: true })
const placementdetails = mongoose.model("placementdetails", Schema)

module.exports = placementdetails
