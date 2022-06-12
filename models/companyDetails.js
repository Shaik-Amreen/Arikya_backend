const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string" },
  code: { type: "string", required: true },
  type: { type: "string", required: true },
  placementcyclename: { type: "string", required: true },
  companyname: { type: "string", required: true },
  companyprofiletitle: { type: "string" },
  companyprofilesource: { type: "string" },
  companylocation: { type: "string" },
  companyfunction: { type: "string" },
  positiontype: { type: "string" },
  category: { type: "string" },
  interval: { type: "string" },
  currency: { type: "string" },
  minimum: { type: "string" },
  maximum: { type: "string" },
  gender: { type: "string" },
  ten: { type: "string" },
  inter: { type: "string" },
  diploma: { type: "string" },
  undergraduate: { type: "string" },
  companydescription: { type: "string" },
  dateofvisit: { type: "string" },
  status: { type: "string" },
  deadline: { type: "string" },
  companycontact: { type: "string" },
  created: { type: "string" },
  ongoingbacklogs: { type: "string" },
  totalbacklogs: { type: "string" },
  updatedon: { type: "string" },
  updatedby: { type: "string" },
  createdon: { type: "string" },
  eligibilties: { type: "Array" },
  hiringworkflow: { type: "Array" },
  companylogo: { type: "string" },
  rejectedList: { type: "Array" },
  submitcode: { type: "String" },
  acceptedList: { type: "Array" }
})
Schema.index({ placementcyclename: 1, companyname: 1, companyprofiletitle: 1 }, { unique: true })

const companydetails = mongoose.model("companydetails", Schema)

module.exports = companydetails
