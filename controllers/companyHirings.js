const Mail = require("../models/placementStatus")
const comhir = require("../models/companyHirings")
const verifyToken = require("./verifyToken")
const manageData = require("./manageData")
const mail = require("./sendmail")
const studentdata = require('../models/studentData')

exports.createhirings = (verifyToken, async (req, res, next) => {


  // console.log(req.body.accepted, req.body.rejected)
  let accept = req.body.accepted.map(a => a.rollnumber);
  let reject = req.body.rejected.map(a => a.rollnumber);
  let collegedataccepted = await studentdata.findOne({ organisation_id: req.body.organisation_id, rollnumber: { "$in": accept } }).distinct('mail')
  let collegedatarejected = await studentdata.findOne({ organisation_id: req.body.organisation_id, rollnumber: { "$in": reject } }).distinct('mail')
  let temphtml = (req.body.lastItem) ? 'Please login to  ARIKYA to accept the offer' : 'Good luck for the next round';

  let mailDetails1 = {
    from: "arikya.hak@gmail.com",
    to: collegedataccepted,
    subject: `Registrations for Arikya testtingg `,

    html: `Hey ! Congratulations you are shortlisted in ${req.body.accepted[0].hiringflowname} in ${req.body.accepted[0].companyname} ${temphtml} `,
  }
  let mailcontent = mailDetails1.html
  let collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails1.subject }
  mail(mailDetails1, collectmail)
  let mailDetails = {
    from: "arikya.hak@gmail.com",
    to: collegedatarejected,
    subject: `Registrations for Arikya testtingg `,
    html: `Hey ! Sorry to inform , you are not shortlisted in ${req.body.accepted[0].hiringflowname} in ${req.body.accepted[0].companyname} . Better luck next time. `,
  }
  mailcontent = mailDetails.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  mail(mailDetails, collectmail)
  req.body.accepted.forEach(async (c, i) => {
    // user = new comhir(c)
    //  console.log(c.rollnumber,"accepted")
    req.body.lastItem && (docs1 = await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, { offerstatus: 'offered' }))
    await comhir.create(c, function (err, results) { })
    if (req.body.accepted.length - 1 == i) {
      if (req.body.rejected.length == 0) {
        res.send({ message: "success" })
      }
      else {
        req.body.rejected.forEach(async (e, index) => {
          // console.log(e.rollnumber,"rejected")
          await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: e.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, { placed: "no", rejectedat: req.body.accepted[0].hiringflowname, offerstatus: 'notoffered' })
          if (req.body.rejected.length - 1 == index) {
            res.send({ message: "success" })
          }
        })
      }
    }
  })
})

exports.updatehirings = (verifyToken, async (req, res, next) => {

  // let collegedata = await manageData.getCollegeData("findOne", { organisation_id: req.body.organisation_id })
  // console.log(req.body.accepted.length, req.body.rejected.length)
  await manageData.postCompanyHirings("deleteMany", { organisation_id: req.body.organisation_id, placementcyclename: req.body.accepted[0].placementcyclename, companyname: req.body.accepted[0].companyname, hiringflowname: req.body.accepted[0].hiringflowname })
  let accept = req.body.accepted.map(a => a.rollnumber);
  let reject = req.body.rejected.map(a => a.rollnumber);
  let collegedataccepted = await studentdata.findOne({ organisation_id: req.body.organisation_id, rollnumber: { "$in": accept } }).distinct('mail')
  let collegedatarejected = await studentdata.findOne({ organisation_id: req.body.organisation_id, rollnumber: { "$in": reject } }).distinct('mail')
  let temphtml = (req.body.lastItem) ? 'Please login to  ARIKYA to accept the offer' : 'Good luck for the next round';
  let mailDetails = {
    from: "arikya.hak@gmail.com",
    to: collegedataccepted,
    subject: `Registrations for Arikya testtingg `,
    html: `Hey ! Congratulations you are shortlisted in ${req.body.accepted[0].hiringflowname} in ${req.body.accepted[0].companyname} ${temphtml} `,
  }
  mailcontent = mailDetails.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }

  let mailDetails1 = {
    from: "arikya.hak@gmail.com",
    to: collegedatarejected,
    subject: `Registrations for Arikya testtingg `,
    html: `Hey ! Sorry to inform , you are not shortlisted in ${req.body.accepted[0].hiringflowname} in ${req.body.accepted[0].companyname} . Better luck next time. `,
  }
  mailcontent = mailDetails1.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails1.subject }


  req.body.accepted.forEach(async (c, i) => {
    // console.log(c.rollnumber, "updateeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    let tempobject;
    await comhir.create(c, function (err, results) {
    })
    if (req.body.lastItem) {
      tempobject = { offerstatus: 'offered', rejectedat: '-', placed: '-' }
      await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, tempobject)
    }
    if (i == req.body.accepted.length - 1) {
      if (req.body.rejected.length == 0) {
        await mail(mailDetails, collectmail)
        await mail(mailDetails1, collectmail)
        res.send({ message: "success" })
      }
      else {
        req.body.rejected.forEach(async (e, ie) => {
          // console.log(e)
          if (req.body.lastItem) {
            tempobject = { offerstatus: 'notoffered', rejectedat: c.hiringflowname, placed: 'no' };
            await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: e.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, tempobject)
          }
          if (ie === req.body.rejected.length - 1) {
            await mail(mailDetails, collectmail)
            await mail(mailDetails1, collectmail)
            res.send({ message: "success" })
          }
        })

      }
    }

  })
})

exports.findplacementwise = (verifyToken, async (req, res, next) => {

  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename })
  data.message != "error" && res.send(data)
})

exports.findcompanywise = (verifyToken, async (req, res, next) => {

  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname })
  data.message != "error" && res.send(data)
})

exports.findstudentwise = (verifyToken, async (req, res, next) => {

  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber, placementcyclename: req.body.placementcyclename })
  data.message != "error" && res.send(data)
})
