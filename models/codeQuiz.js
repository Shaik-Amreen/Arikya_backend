const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string", required: true },
  topic: { type: "string", required: true },
  questions: { type: "Array", required: true },
  totaltime: { type: "string" },
  totalmarks: { type: "string" },
  ratings: { type: Array },
  tempratings: { type: Array },
  startson: { type: "string" },
  endson: { type: "string" },
  type: { type: "String" },
  createdby: { type: "string" },
})

Schema.index({ organisation_id: 1, topic: 1, type: 1 }, { unique: true })

const codequiz = mongoose.model("codequiz", Schema)

module.exports = codequiz
