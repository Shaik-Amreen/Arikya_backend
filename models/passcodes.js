const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  code: { type: "string", required: true },
  organisation_id: { type: "string", required: true },
  mail:{type:"string",require:true},
  role:{type:"string",required:true},
  
})
const passcodes = mongoose.model("passcode", Schema)
module.exports = passcodes
