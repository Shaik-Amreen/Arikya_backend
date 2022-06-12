const collegeData = require("../models/collegeData")
var randomstring = require("randomstring")
const nodemailer = require("nodemailer")
const mailcollection = require("../models/mail")
const mail = require("./sendmail")
const manageData = require("./manageData")
const verifyToken = require("./verifyToken")

exports.postdata = (async (req, res, next) => {

  let mailcontent = 'Registrations in arikya'
  async function sampost() {
    const ran = () => { return randomstring.generate(6) }
    let sran = ran()
    req.body.code = sran
    docs2 = await manageData.getUsers("findOne", { code: sran })
    if (docs2 == null) {
      let mailDetails = {
        from: "Arikya",
        to: [req.body.mail],
        subject: `Hurry ! to sign up - ARIKYA`,
        html: `
          <strong style="font-size:0.9rem">Greetings from ARIKYA ! </strong>
          <br/><br/>
          <span style="font-size:0.9rem;line-height:20px">
          Congratulations ! You are <strong>${req.body.role.toUpperCase()}</strong> now. Wanna make better tomorrow in co-orperate world ? Consider <strong> ARIKYA </strong>
          your first priority .
          Hurry up ! don't wait .. time will never be perfect.
          <br/>
          <span><strong>Registration Link : <a href="https://arikya.herokuapp.com">ARIKYA</a> </strong><span><br/>
          <span><strong>Passcode<strong> ${sran} </span>
          </span>
          <br/><br/>
          Best Regards ,<br/>
          <strong>ARIKYA</strong> .      
          `,
      }
      let college = await manageData.getCollegeData("findOne", { organisation_id: req.body.organisation_id });
      if (!college) {
        await manageData.postCollegeData("create", req.body);
      }
      let postusers = await manageData.postUsers("create", req.body);
      collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
      if (mail(mailDetails, collectmail)) {
        res.send({ message: "poor connection" })
      } else {
        // console.log(postusers);
        (postusers.message == "success") ? res.send({ message: "success" }) : res.send({ message: "error" })
      }
    }
    else { sampost() }
  }
  sampost()
})

exports.findata = (async (req, res, next) => {

  let docs = await manageData.getUsers("findOne", { code: req.body.passcode });
  if (docs) {
    if (docs.password == '') {
      res.send({ message: "success", data: docs })
    }
    else {
      res.send({ message: "error", errormsg: "passcode is already used" })
    }
  }
  else {
    res.send({ message: "error", errormsg: "Invalid passcode" })
  }
})



exports.findCollegeName = (async (req, res, next) => {

  let data = await manageData.getCollegeData("findOne", { organisation_id: req.body.organisation_id })
  res.send(data)
})

// exports.findata = (verifyToken, async (req, res, next) => {       req.body=JSON.parse(atob(req.body.data))
//   console.log(req.body.passcode)
//   docs0 = await manageData.getPasscodes("findOne", { code: req.body.passcode })
//   if (!docs0) { res.send({ message: "error" }) }
//   else {
//     docs = await manageData.getCollegeData("findOne", { organisation_id: docs0.organisation_id }); !docs && res.send({ message: "error" })
//     let temp = Object.keys(docs.access)
//     for (let i = 0; i < temp.length; i++) {
//       if (docs.access[temp[i]].includes(req.body.passcode)) {
//         return res.send({ message: temp[i], organisation_id: docs0.organisation_id });
//       } else if (i == temp.length - 1) {
//         return res.send({ message: "error" })
//       }
//     }
//   }
// })

// exports.postdata = (verifyToken, async (req, res, next) => {       req.body=JSON.parse(atob(req.body.data))
//   async function sampost() {
//     const ran = () => {
//       return randomstring.generate(6)
//     }
//     let sran = ran()
//     docs2 = await manageData.getPasscodes("findOne", { code: sran })
//     if (docs2 == null) {
//       req.body.access[req.body.role].push(sran)
//       req.body.adminmails.push(req.body.mail)
//       await manageData.postCollegeData("create", req.body)
//       await manageData.postPasscodes("create", { code: sran, organisation_id: req.body.organisation_id }); let mailDetails = {
//         from: "placementscycle@gmail.com",
//         to: [req.body.mail],
//         subject: `Registrations for Arikya testtingg `,
//         html: `${sran} passcode`,
//       }
//       console.log("mailDetails", mailDetails)
//       var mailcontent = mailDetails['html']
//       var collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
//       if (mail(mailDetails, collectmail)) { res.send({ message: 'error' }) } else { res.send({ message: 'success' }); }
//     } else if (docs2 != null) {
//       sampost()
//     }
//   }
//   sampost()
// })



exports.updatedata = (verifyToken, async (req, res, next) => {

  async function sampost() {
    const ran = () => {
      return randomstring.generate(6)
    }
    let sran = ran()
    docs2 = await manageData.getPasscodes("findOne", { code: sran })
    if (docs2 == null) {
      docs3 = await manageData.getCollegeData("findOne", { organisation_id: req.body.organisation_id }); docs3.access[req.body.role].push(sran)
      if (req.body.role == "admin") {
        docs3.adminmails.push(req.body.mail)
      }
      docs3 = await manageData.updateCollegeData("updateOne", { organisation_id: req.body.organisation_id }, docs3)
      docs1 = await manageData.postPasscodes("create", { code: sran, organisation_id: req.body.organisation_id });
      let mailDetails = {
        from: "Arikya",
        to: [req.body.mail],
        subject: `Hurry ! to sign up - ARIKYA`,
        html: `
          <strong style="font-size:0.9rem">Greetings from ARIKYA ! </strong>
          <br/><br/>
          <span style="font-size:0.9rem;line-height:20px">
          Congratulations ! You are <strong>${req.body.role}</strong> now. Wanna make better tomorrow in co-orperate world ? Consider <strong> ARIKYA </strong>
          your first priority .
          Hurry up ! don't wait .. time will never be perfect.
          <br/>
          <span><strong>Registration Link : <a href="https://arikya.herokuapp.com">ARIKYA</a> </strong><span><br/>
          <span><strong>Passcode<strong> ${sran} </span>
          </span>
          <br/><br/>
          Best Regards ,<br/>
          <strong>ARIKYA</strong> .      
          `,
      }
      mailcontent = mailDetails.html
      collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
      // console.log("collectmail,mailDetails", collectmail, mailDetails)
      if (mail(mailDetails, collectmail)) { res.send({ message: 'error' }) } else { res.send({ message: 'success' }); }
    } else if (docs2.message == null) {
      sampost()
    }
  }
  sampost()
})



exports.deletedata = (verifyToken, async (req, res, next) => {

  data = await manageData.updatecollegeData("deleteOne", { organisation_id: req.body.organisation_id }, req.body)
  data.message == 'error' ? res.send({ message: "error" }) : res.send({ message: "success" })
})


