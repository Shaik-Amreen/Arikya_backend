const Admin = require("../models/facultyData")
const verifyToken = require("./verifyToken")

exports.findoneAdmin = (verifyToken, async (req, res) => {

  const admindata = await Admin.findOne({ organisation_id: req.body.organisation_id, mail: req.body.mail }).lean();
  (admindata == null || admindata.message == 'error') ? res.send("error") : res.status(200).send({ admindata: admindata })
})

exports.findfacdata = (verifyToken, async (req, res) => {

  const admindata = await Admin.find({ organisation_id: req.body.organisation_id }).lean();
  (admindata == null || admindata.message == 'error') ? res.send("error") : res.status(200).send(admindata)
})

exports.updateAdmin = (verifyToken, (req, resp) => {

  // console.log("req.body",req.body)
  Admin.updateOne({ organisation_id: req.body.organisation_id, mail: req.body.mail },
    { $set: req.body }, (err, res) => {
      // console.log(res);
      !err && res.nModified != 0 ? (resp.send({ data: btoa(JSON.stringify({ msg: "success" })) })) : (resp.send({ data: btoa(JSON.stringify({ msg: "error" })) }))
    })
})

exports.deleteoneAdmin = (verifyToken, (req, res) => {

  Admin.updateOne(req.body, (err, docs) => {
    !err ? res.send({ message: "success" }) : console.log("error while  retrivieng all records: ", JSON.stringify(err, undefined, 2))
  })
})
