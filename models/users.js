const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  organisation_id: { type: "string", required: true },
  mail: { type: "string", required: true, index: { unique: true, dropDups: true }, },
  password: { type: "string" },
  role: { type: "string", required: true },
  status: { type: "string" },
  code: { type: "string" },
  createdby: { type: "string" }
})
const Users = mongoose.model("User", Schema, "Users")

module.exports = Users
