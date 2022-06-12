const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
  mail: {
    type: "string",
    required: true,
    index: { unique: true, dropDups: true },
  },
  firstname: { type: "string", required: true },
  middlename: { type: "string" },
  lastname: { type: "string" },
  contact: { type: "string", required: true },
  designation: { type: "string", required: true },
  role: { type: "string", required: true },
  status: { type: "string" },
  organisation_id: { type: "string" },
  testaccess: { type: "string" },
  profilepic: { type: "string" },
  codeaccess:{type:"string"},
  quizaccess:{type:"string"},
})
const facultydata = mongoose.model("facultydata", Schema)

module.exports = facultydata
