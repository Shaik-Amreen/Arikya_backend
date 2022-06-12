const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string", unique: "true", index: "true" },
  organisation: { type: "string", required: true },
  shortname: { type: "string", required: true },
  date: { type: "string", required: true },
  mail: { type: "string", required: true },
  createdby: { type: "string", required: true },
  type: { type: "string", required: true },
  mailvalidation: { type: "string", required: true },
  maximumstudents: { type: "string", required: true },
  arikyastatus: { type: "string", required: true }
})

const collegedata = mongoose.model("collegedata", Schema)
module.exports = collegedata
