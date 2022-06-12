const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  to: { type: "string", requqired: true },
  subject: { type: "string", required: true },
  content: { type: "string", required: true },
  organisation_id: { type: "string" },
})
const mailcollection = mongoose.model("mails", Schema)
module.exports = mailcollection
