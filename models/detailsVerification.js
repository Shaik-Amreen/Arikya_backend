const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  rollnumber: {
    type: "string",
    required: true,

  },
  mail: {
    type: "string",
    required: true,

  },
  fullname: { type: "string", required: true },
  prev: { type: "string", required: true },
  current: { type: "string", required: true },
  field: { type: "string", required: true },
  verified: { type: "string" },
  date: { type: "string", required: true },
  organisation_id: { type: "string" },
  verifiedby: { type: "string" },
  verifiedbymail: { type: "string" },
})
const detailsverification = mongoose.model("detailsverification", Schema)

module.exports = detailsverification
