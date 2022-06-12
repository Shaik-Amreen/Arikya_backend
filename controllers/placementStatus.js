
const verifyToken = require("./verifyToken")
const manageData = require('./manageData')
const placementStatus = require('../models/placementStatus')
const placementDetails = require('../models/placementDetails')
const studentData = require('../models/studentData')
const crypto = require("crypto")
const mail = require("./sendmail")
var randomstring = require("randomstring")


const filterEligible = async (redata) => {
  let sendlist = []
  let studentdata = await manageData.getStudentData('find', { organisation_id: redata.organisation_id })
  // filtering based on student's interest in placementcycle
  studentdata = studentdata.filter((a) =>
    a.eligibleplacementcycles.some(
      (f) => (f[0].placementcyclename == redata.placementcyclename && f[0][redata.placementcyclename] == "yes")
    ))
  //filtering based on course and department
  studentdata = studentdata.filter((a) =>
    redata.eligibilties.some(
      (f) => f[0].course == a.course && f[0].department == a.department
    ))
  //filtering basedon gender , verification and freeze
  studentdata = studentdata.filter((e) => e.verified == "yes" && e.freeze == "no" && (redata.gender != "malefemale" ? redata.gender == e.gender : redata.gender.includes(e.gender)))
  //filtering based on backlogs
  if (redata.backlogs != "no" && redata.totalbacklogs != 0) {
    studentdata = studentdata.filter((a) => (a.ongoingbacklogs == '' && a.totalbacklogs == '') || (a.ongoingbacklogs <= redata.ongoingbacklogs && a.totalbacklogs <= redata.totalbacklogs))
  }
  else if (redata.backlogs == "no") {
    studentdata = studentdata.filter((a) => a.ongoingbacklogs == 0 || a.ongoingbacklogs == '')
  }
  //filtering  based on percentage
  await studentdata.map((a) => {
    (a.tenthcgpa * 10 >= redata.ten && (a.intercgpa * 10 >= redata.inter || a.intercgpa * 10 - 5 >= redata.diploma) && a.cgpa * 10 >= redata.undergraduate)
      && sendlist.push({ mail: a.mail, rollnumber: a.rollnumber })
  })


  return sendlist

}



exports.sendmail = (verifyToken, async (req, res, next) => {

  let placementdata = await manageData.getPlacementDetails('findOne', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename })
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id });
  let studentdata = await filterEligible(req.body)
  let noteligible = [], maxpackage, mailsentstudents = [];
  mailsentstudents = await placementstatus.filter(p => p.companyname == req.body.companyname && p.placementcyclename == placementdata.placementcyclename).map(m => m.mail);
  // placementstatus = await placementstatus.filter(p => p.package != '-')
  // if (req.body.maximum != "") {
  //   let uniqueplacementstatus = await placementstatus.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  //   uniqueplacementstatus.map(u => (
  //     templacementstatus = placementstatus.filter(t => t.mail == u.mail),
  //     maxpackage = Math.max(...templacementstatus.map(o => o.package)),
  //     (maxpackage > req.body.package) && noteligible.push(u.mail)
  //   ))
  // }
  noteligible = [...noteligible, ...mailsentstudents]
  const token = crypto.randomBytes(32).toString("hex")
  studentdata = studentdata.filter(s => !noteligible.includes(s.mail))
  if (studentdata.length > 0) {
    mails = studentdata.map(m => m.mail)
    // console.log(studentdata)
    let sample = {
      companyname: req.body.companyname,
      joblocation: req.body.joblocation,
      placementcyclename: req.body.placementcyclename,
      registered: "no",
      organisation_id: req.body.organisation_id,
      placed: "-",
      date: new Date(),
      token: token,
      package: "-",
      offerletter: "-",
      placeddate: "-",
      offerstatus: "-",
      offerdate: "-",
      verifiedoffer: "-",
      rejectedat: "-",
      placementcode: placementdata.code,
      companycode: req.body.code,
      type: req.body.type,
      companylocation: "-",
      eligible: true
    }
    studentdata = await studentdata.map(obj => ({
      ...obj,
      ...sample,
    }))
    // console.log(studentdata)
    let mailDetails = {
      from: req.body.created,
      to: mails,
      subject: `ARIKYA - Open for Applications of ${req.body.companyname}`,
      html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
      <a href="http://localhost:4200/registration/${token}/${placementdata.code}/${req.body.code}/${req.body.organisation_id}">click here</a> to register.
      For more details login to arikya</p><br/> Best Regards<br/> <b>ARIKYA<br/></b>`,
    }
    let mailcontent = `Applications are now being accepted for ${req.body.companyname}. Jobprofile : ${req.body.companyprofiletitle} - ${req.body.positiontype} - click here to register.For more details login to arikya.Best Regards <br/> ARIKYA`
    collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
    await mail(mailDetails, collectmail) ? console.log("") : (
      placementStatus.create(studentdata, (errors, md) => {
        res.send({ message: 'success' })
      })
    )
  }
  else {
    res.send({ message: 'success' })
  }
})

// exports.tempsendmail = (verifyToken, async (req, res, next) => {       req.body=JSON.parse(atob(req.body.data))
//   var sendlist = []
//   placementDetails.findOne(
//     {
//       organisation_id: req.body.organisation_id,
//       placementcyclename: req.body.placementcyclename,
//     },
//     (epla, placename) => {
//       studentData.find({ organisation_id: req.body.organisation_id }, (error, data) => {
//         data = data.filter((a) =>
//           a.eligibleplacementcycles.some(
//             (f) => (f[0].placementcyclename == req.body.placementcyclename && f[0][req.body.placementcyclename] == "yes")
//           )
//         )
//         data = data.filter((a) =>
//           req.body.eligibilties.some(
//             (f) => f[0].course == a.course && f[0].department == a.department
//           )
//         )
//         data = data.filter(
//           (e) =>
//             e.verified == "yes" &&
//             e.freeze == "no" &&
//             (req.body.gender != "malefemale"
//               ? req.body.gender == e.gender
//               : req.body.gender.includes(e.gender))
//         )
//         if (req.body.backlogs != "no" && req.body.totalbacklogs != 0) {
//           data = data.filter((a) => (a.ongoingbacklogs == '' && a.totalbacklogs == '') || (a.ongoingbacklogs <= req.body.ongoingbacklogs && a.totalbacklogs <= req.body.totalbacklogs))
//         }
//         else if (req.body.backlogs == "no") {
//           data = data.filter((a) => a.ongoingbacklogs == 0 || a.ongoingbacklogs == '')
//         }
//         data.forEach((a) => {
//           if (
//             a.tenthcgpa * 10 >= req.body.ten &&
//             (a.intercgpa * 10 >= req.body.inter ||
//               a.intercgpa * 10 - 5 >= req.body.diploma) &&
//             a.cgpa * 10 >= req.body.undergraduate
//           ) {
//             sendlist.push({ mail: a.mail, rollnumber: a.rollnumber })
//           }
//         })

//         placementStatus.find(
//           { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname },
//           (err, maildat) => {

//             if (!err) {

//               sendlist = sendlist.filter((a) =>
//                 maildat.every(
//                   (f) => (f.rollnumber != a.rollnumber)
//                 )
//               )





//               var finalist = [],
//                 maildata = [],
//                 maxvalue = 0,
//                 k
//               if (req.body.maximum != "" && maildat.length != 0) {
//                 if (maildat.length > 2) {
//                   for (let i = 0; i < maildat.length; i++) {
//                     c = 0
//                       ; (maxvalue = maildat[i].package), (k = i)
//                     for (let j = i + 1; j < maildat.length; j++) {
//                       c++
//                       if (maildat[i].mail == maildat[j].mail) {
//                         if (maxvalue < maildat[j].package) {
//                           maxvalue = maildat[j].package
//                           k = j
//                         }
//                         if (j + c == maildat.length) {
//                           maildata.push(maildat[k])
//                         }
//                       } else if (j == maildat.length) {
//                         maildata.push(maildat[k])
//                       }
//                     }
//                   }
//                 } else {
//                   maildata = maildat
//                 }
//                 maildata.map((m) =>
//                   sendlist.map((s) =>
//                     s.mail == m.mail
//                       ? m.package < req.body.maximum
//                         ? finalist.push(s)
//                         : null
//                       : finalist.push(s)
//                   )
//                 )
//               } else {
//                 finalist = sendlist
//               }
//               const token = crypto.randomBytes(32).toString("hex")
//               var mailist = []
//               for (let c of finalist) {
//                 (c.companyname = req.body.companyname),
//                   (c.joblocation = req.body.joblocation),
//                   (c.placementcyclename = req.body.placementcyclename),
//                   (c.registered = "no"),
//                   (c.organisation_id = req.body.organisation_id),
//                   (c.placed = "-"),
//                   (c.date = new Date()),
//                   (c.token = token),
//                   (c.package = "-"),
//                   (c.offerletter = "-"),
//                   (c.placeddate = "-"),
//                   (c.offerstatus = "-"),
//                   (c.offerdate = "-"),
//                   (c.verifiedoffer = "-"),
//                   (c.rejectedat) = "-"
//                 c.placementcode = placename.code,
//                   c.companycode = req.body.code
//                 c.type = req.body.type
//                 c.companylocation = "-"

//                 mailist.push(c.mail)
//               }
//               let mailDetails = {
//                 from: req.body.created,
//                 to: mailist,
//                 subject: `ARIKYA - Open for Applications of ${req.body.companyname}`,
//                 html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
// <a href="http://localhost:4200/registration/${token}/${placename.code}/${req.body.code}/${req.body.organisation_id}">click here</a> to register.
// For more details login to arikya</p><br/> Best Regards<br/> <b>ARIKYA<br/></b>`,
//               }

//               let mailcontent = `Applications are now being accepted for ${req.body.companyname}. Jobprofile : ${req.body.companyprofiletitle} - ${req.body.positiontype} - click here to register.For more details login to arikya.Best Regards-Arikya`
//               collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }

//               mail(mailDetails, collectmail) ? console.log(err) : (

//                 placementStatus.create(finalist, (errors, md) => {
//                   res.send({ message: 'success' })
//                 })
//               )
//             }
//           }
//         )
//       })
//     }
//   )
// })

// exports.tempeligible = (verifyToken, async (req, res, next) => {       req.body=JSON.parse(atob(req.body.data))
//   var sendlist = [];
//   placementDetails.findOne(
//     {
//       organisation_id: req.body.organisation_id,
//       placementcyclename: req.body.placementcyclename,
//     },
//     (err1, docs1) => {
//       let elyear = []
//       if (docs1) {

//         docs1.batch.forEach((e) => elyear.push(e[0].batchvalue))
//       }
//       // console.log("docs1", docs1)
//       studentData.find({ organisation_id: req.body.organisation_id }, (error, data) => {
//         data = data.filter((a) =>
//           req.body.eligibilties.some(
//             (f) => f[0].course == a.course && f[0].department == a.department
//           )
//         )

//         // console.log("data", data)
//         // data = data.filter((a) =>
//         //   elyear.some((f) => f == parseInt(a.yearofjoining) + 4)
//         // )

//         data = data.filter((a) =>
//           a.eligibleplacementcycles.some(
//             (f) => (f[0].placementcyclename == req.body.placementcyclename && f[0][req.body.placementcyclename] == "yes")
//           )
//         )


//         data = data.filter(
//           (e) =>
//             e.verified == "yes" &&
//             e.freeze == "no" &&
//             (req.body.gender != "malefemale"
//               ? req.body.gender == e.gender
//               : req.body.gender.includes(e.gender))
//         )

//         if (req.body.backlogs != "no" && req.body.totalbacklogs != 0) {
//           data = data.filter(
//             (a) => (a.ongoingbacklogs == '' &&
//               a.totalbacklogs == '') ||
//               (a.ongoingbacklogs <= req.body.ongoingbacklogs &&
//                 a.totalbacklogs <= req.body.totalbacklogs)
//           )
//         }

//         else if (req.body.backlogs == "no") {
//           data = data.filter((a) => a.totalbacklogs == 0 || a.totalbacklogs == '')
//         }
//         // console.log("data", data)

//         data.map((a) => (
//           (
//             a.tenthcgpa * 10 >= req.body.ten &&
//             (a.intercgpa * 10 >= req.body.inter ||
//               a.intercgpa * 10 >= req.body.diploma) &&
//             a.cgpa * 10 >= req.body.undergraduate
//           ) ?
//             sendlist.push({ mail: a.mail, rollnumber: a.rollnumber })
//             : null
//         ))

//         console.log("Sendlist", sendlist)

//         placementStatus.find(
//           { organisation_id: req.body.organisation_id },
//           (err, maildat) => {
//             if (!err) {
//               var finalist = [],
//                 maildata = [],
//                 maxvalue = 0,
//                 k
//               if (req.body.maximum != "" && maildat.length != 0) {
//                 if (maildat.length > 2) {
//                   for (let i = 0; i < maildat.length; i++) {
//                     c = 0;
//                     (maxvalue = maildat[i].package), (k = i)
//                     for (let j = i + 1; j < maildat.length; j++) {
//                       c++
//                       if (maildat[i].mail == maildat[j].mail) {

//                         if (maxvalue < maildat[j].package) {
//                           maxvalue = maildat[j].package
//                           k = j
//                         }
//                         if (j + c == maildat.length) {
//                           maildata.push(maildat[k])
//                         }
//                       } else if (j == maildat.length) {
//                         maildata.push(maildat[k])
//                       }
//                     }
//                   }
//                 } else {
//                   maildata = maildat
//                 }
//                 maildata.map((m) =>
//                   sendlist.map((s) =>
//                     s.mail == m.mail
//                       ? m.package < req.body.maximum
//                         ? finalist.push(s)
//                         : null
//                       : finalist.push(s)
//                   )
//                 )
//               } else {
//                 finalist = sendlist
//               }
//               finalist = finalist.filter(
//                 (v, i, a) => a.findIndex((t) => t.mail === v.mail) === i
//               )
//               console.log(finalist, sendlist, "finallllllllllllllll")
//               placementStatus.find(
//                 {
//                   organisation_id: req.body.organisation_id,
//                   placementcyclename: req.body.placementcyclename,
//                   companyname: req.body.companyname,
//                 },
//                 (errs, docsmaildata) => {
//                   var registered = docsmaildata.filter(
//                     (e) => e.registered == "yes")
//                   var placed = docsmaildata.filter((e) => e.placed == "yes")
//                   res.send({
//                     data: finalist,
//                     rdata: registered,
//                     edata: placed,
//                   })
//                 }
//               )
//             }
//           }
//         )
//       })
//     }
//   )
// })

exports.eligible = (verifyToken, async (req, res, next) => {

  let placementdata = await manageData.getPlacementDetails('findOne', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename })
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id });
  let studentdata = await filterEligible(req.body);
  let noteligible = [], maxpackage;
  // if (req.body.maximum != "") {
  //   let uniqueplacementstatus = await placementstatus.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  //   uniqueplacementstatus.map(u => (
  //     templacementstatus = placementstatus.filter(t => t.mail == u.mail),
  //     maxpackage = Math.max(...templacementstatus.map(o => o.package)),
  //     (maxpackage > req.body.package) && noteligible.push(u.mail)
  //   ))
  // }
  // studentdata = studentdata.filter(s => !noteligible.includes(s.mail))
  // console.log(studentdata,"studentdata")
  studentdata = studentdata.map(s => { return s.rollnumber })
  // console.log(studentdata,"studentdata")

  let placementstddata = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, eligible: true }, { _id: 0, rollnumber: 1 });
  placementstddata = placementstddata.map(a => { return a.rollnumber })
  studentdata = studentdata.concat(placementstddata)
  // console.log(studentdata.length)
  studentdata = [...new Set(studentdata)]
  // console.log(studentdata.length)

  placementstddata = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, eligible: false }, { _id: 0, rollnumber: 1 });
  let registered = await placementstatus.filter(p => p.companyname == req.body.companyname && p.registered == 'yes' && p.placementcyclename == placementdata.placementcyclename);
  let placed = await registered.filter(r => r.placed == "yes")
  res.send({
    data: studentdata,
    rdata: registered,
    edata: placed,
    noteligibleminus: placementstddata.length
  })
})

exports.checktoken = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcode: req.body.placementcyclename, companycode: req.body.companyname, token: req.body.token }, { _id: 0 });
  let placementdetails = await manageData.getPlacementDetails('findOne', { code: req.body.placementcyclename, organisation_id: req.body.organisation_id }, { _id: 0 });
  let companydetails = await manageData.getCompanyDetails('findOne', { code: req.body.companyname, organisation_id: req.body.organisation_id, placementcyclename: placementdetails.placementcyclename }, { _id: 0 });
  placementstatus.length != 0 ? res.send({ message: "done", placementcyclename: placementdetails.placementcyclename, companyname: companydetails.companyname }) : res.send({ message: "invalid" })
})

exports.checkregistered = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('findOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename, }, { _id: 0 });
  placementstatus ? placementstatus.registered == "yes" ? res.send({ message: "success" }) : res.send({ message: "no" }) : res.send({ message: "error" })
})

exports.adminplaced = (verifyToken, async (req, res, next) => {

  req.body.placeddate = new Date()
  let placementstatus = await manageData.updatePlacementStatus('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename }, req.body)
  res.send(placementstatus)
})

exports.updateregisteredcompany = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.updatePlacementStatus('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename, eligible: true }, { registered: "yes" })
  // console.log(placementstatus,".........................")
  res.send(placementstatus)

})

exports.updateregisteredmulti = (verifyToken, async (req, res, next) => {

  // console.log(req.body);
  let rollnumbersdata, notrollnumbersdata, placename, token;
  req.body.applicantstatus == 'Add' ? (registered = 'yes', eligible = true,
    rollnumbersdata = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, rollnumber: { $in: req.body.rollnumbers }, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename }, { _id: 0, rollnumber: 1 }),
    rollnumbersdata = rollnumbersdata.map(a => { return a.rollnumber }),
    notrollnumbersdata = req.body.rollnumbers.filter((a) => { if (!rollnumbersdata.includes(a)) return a; }),
    // console.log(notrollnumbersdata,"notrollnumbersdata"),
    placename = await manageData.getPlacementDetails('findOne', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename }),
    token = crypto.randomBytes(32).toString("hex"),
    uploaddata = [],
    await notrollnumbersdata.forEach(async (a, i) => {
      let studentdata = await manageData.getStudentData('findOne', { organisation_id: req.body.organisation_id, rollnumber: a }, { _id: 0, mail: 1 });
      // console.log(studentdata, "studentdata")
      if (studentdata) {
        let c = {};
        c.companyname = req.body.companyname;
        c.companylocation = req.body.companylocation;
        c.placementcyclename = req.body.placementcyclename;
        c.registered = "yes";
        c.organisation_id = req.body.organisation_id;
        c.placed = "-";
        c.date = new Date();
        c.token = token;
        c.package = "-";
        c.offerletter = "-";
        c.placeddate = "-";
        c.offerstatus = "-";
        c.offerdate = "-";
        c.verifiedoffer = "-";
        c.rejectedat = "-"
        c.placementcode = placename.code
        c.companycode = req.body.code
        c.type = req.body.type
        c.companylocation = "-";
        c.eligible = true;
        c.rollnumber = a;
        c.mail = studentdata.mail;
        uploaddata.push(c)
      }
      if (notrollnumbersdata.length - 1 == i) {
        // console.log(uploaddata, "uploaddata");
        await manageData.postPlacementStatus('create', uploaddata)
      }
    })
  ) : (registered = 'no', eligible = false);
  (req.body.updateeligibility) ? registered = 'no' : null;
  // console.log(req.body.rollnumbers, "req.body.rollnumbers", req.body.applicantstatus, "req.body.applicantstatus", registered, eligible, " registered, eligible")
  let placementstatus = await manageData.updatePlacementStatus('updateMany', { organisation_id: req.body.organisation_id, rollnumber: { $in: req.body.rollnumbers }, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename }, { registered: registered, eligible: eligible })
  req.body.applicantstatus == 'Add' ? (registered = 'yes', eligible = true) : (registered = 'no', eligible = false);
  // let placementstatus = await manageData.updatePlacementStatus('updateMany', { organisation_id: req.body.organisation_id, rollnumber: { $in: req.body.rollnumbers }, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename }, { registered: registered, eligible: eligible })
  // console.log(placementstatus)
  res.send(placementstatus)
})


exports.addstu = (verifyToken, async (req, res, next) => {

  var finalist = [];
  let accepteddata;
  // console.log(req.body.acceptedList, "req.body.acceptedList----------------", req.body.presentcompany, req.body.companyprofiletitle);
  (!req.body.acceptedList) ? req.body.acceptedList = [] :
    req.body.acceptedList.forEach((a) => {
      if (a[0].companyname == req.body.presentcompany && a[0].companyprofiletitle == req.body.companyprofiletitle) {
        accepteddata = 1;
      }
    });
  // console.log(accepteddata, "accepteddata")
  if (accepteddata != 1) {
    req.body.acceptedList.push(
      {
        placementcyclename: req.body.placementcyclename,
        companyname: req.body.presentcompany,
        companyprofiletitle: req.body.companyprofiletitle
      }
    )
    // console.log(req.body.acceptedList, "req.body.acceptedList")
    let updatedstatus = await manageData.updateCompanyDetails('update', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { acceptedList: req.body.acceptedList })
    let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.presentcompany }, { _id: 0 });
    let placed = await placementstatus.filter(e => e.placed == 'yes')
    if (placed > 0) {
      let templacement = await placementstatus.find({ organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { _id: 0 }).distinct("mail");

      placed.forEach((pl, ci) => {
        var mailist = []
        if (!templacement.includes(pl.mail)) {
          finalist.push({ mail: pl.mail, rollnumber: pl.rollnumber })
          mailist.push(pl.mail)
        }
        if (ci == placed.length - 1) {
          if (finalist.length > 0) {
            const token = crypto.randomBytes(32).toString("hex")
            finalist.map(c =>
              (c.companyname = req.body.companyname),
              (c.joblocation = req.body.joblocation),
              (c.placementcyclename = req.body.placementcyclename),
              (c.registered = "no"),
              (c.organisation_id = req.body.organisation_id),
              (c.placed = "-"),
              (c.date = new Date()),
              (c.token = token),
              (c.package = "-"),
              (c.offerletter = "-"),
              (c.placeddate = "-"),
              (c.offerstatus = "-"),
              (c.offerdate = "-"),
              (c.verifiedoffer = "-"),
              (c.rejectedat) = "-",
              c.eligible = true,
              c.placementcode = docsplace.code,
              c.companycode = req.body.code,
              c.type = req.body.type,

              placementdetails.findOne({ organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename }, (errolace, docsplace) => {
                let mailDetails = {
                  from: "Arikya",
                  to: mailist,
                  subject: `mits - Open for Applications of ${req.body.companyname}`,
                  html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
  <a href="http://localhost:4200/registration/${token}/${docsplace.code}/${req.body.code}/${req.body.organisation_id}">click here</a> to register.
  For more details login to arikya</p><br/> Best Regards<br/> <b>mits<br/>Placements office</b>`,
                }
                let mailcontent = `Applications are now being accepted for ${req.body.companyname}
                  Jobprofile : ${req.body.companyprofiletitle} - ${req.body.positiontype}
                  click here to register.
                  For more details login to arikya.
                  Best Regards-mits-Placements office`
                collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
                if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
                else {
                  placementStatus.create(finalist, (errors, md) => {
                    res.send({ message: 'No students left to send mail' })
                  })
                }

              })
            )
          }
          else {
            res.send({ message: "Added students" })
          }
        }
      })

    }
    else {
      res.send({ message: 'No students are placed in this company' })
    }
  }
  else {
    res.send({ message: "Company Already Added" })
  }
})

exports.removestu = (verifyToken, async (req, res, next) => {

  var finalist = [];
  let rejecteddata;
  // console.log(req.body.rejectedList, "req.body.rejectedList");
  (!req.body.rejectedList) ? req.body.rejectedList = [] :
    req.body.rejectedList.forEach((a) => {
      if (a[0].companyname == req.body.presentcompany && a[0].companyprofiletitle == req.body.companyprofiletitle) {
        rejecteddata = 1;
      }
    });
  if (rejecteddata != 1) {
    req.body.rejectedList.push(
      {
        placementcyclename: req.body.placementcyclename,
        companyname: req.body.presentcompany,
        companyprofiletitle: req.body.companyprofiletitle
      }
    )
    // console.log(req.body.rejectedList, "req.body.rejectedList")
    await manageData.updateCompanyDetails('updateOne', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { rejectedList: req.body.rejectedList })
    let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.presentcompany }, { _id: 0 });
    let placed = await placementstatus.filter(e => e.placed == 'yes')
    if (placed > 0) {
      let templacement = await placementstatus.find({ organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { _id: 0 }).distinct("mail");

      placed.forEach((pl, ci) => {
        var mailist = []
        if (!templacement.includes(pl.mail)) {
          finalist.push({ mail: pl.mail, rollnumber: pl.rollnumber })
          mailist.push(pl.mail)
        }
        if (ci == placed.length - 1) {
          if (finalist.length > 0) {
            const token = crypto.randomBytes(32).toString("hex")
            finalist.map(c =>
              manageData.updateplacementstatus("updateOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, rollnumber: c.rollnumber }, { registered: 'no', eligible: false })
              // placementdetails.findOne({ organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename }, (errolace, docsplace) => {
              //             let mailDetails = {
              //               from: "Arikya",
              //               to: mailist,
              //               subject: `mits - Open for Applications of ${req.body.companyname}`,
              //               html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
              // <a href="http://localhost:4200/registration/${token}/${docsplace.code}/${req.body.code}/${req.body.organisation_id}">click here</a> to register.
              // For more details login to arikya</p><br/> Best Regards<br/> <b>mits<br/>Placements office</b>`,
              //             }
              //             let mailcontent = `Applications are now being accepted for ${req.body.companyname}
              //                 Jobprofile : ${req.body.companyprofiletitle} - ${req.body.positiontype}
              //                 click here to register.
              //                 For more details login to arikya.
              //                 Best Regards-mits-Placements office`
              //             collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
              // if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
              // else {
              //   placementStatus.create(finalist, (errors, md) => {
              //     res.send({ message: 'No students left to send mail' })
              //   })
              // }

              // })
            )
          }
          else {
            res.send({ message: "Removed students" })
          }
        }
      })

    }
    else {
      res.send({ message: 'No students are placed in this company' })
    }
  }
  else {
    res.send({ message: "Company Already Removed" })
  }

})

exports.updateplaced = (verifyToken, async (req, res, next) => {

  let updateplacementstatus = ''
  req.body.data.map(async (c, i) => (
    updateplacementstatus = await manageData.updateCollegeData('updateOne', {
      organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, registered: "yes", placementcyclename: c.placementcyclename, companyname: c.companyname,
    }, { placed: "yes", joblocation: c.joblocation, package: c.package }),
    (i == req.body.data.length) && res.send(updateplacementstatus)
  ))
})


exports.applicants = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, registered: "yes" }, { _id: 0 });
  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  studentdata = studentdata.filter(ad => placementstatus.some(fd => fd.mail == ad.mail));
  studentdata.map((e) => e.ongoingbacklogs != "" ? (e.ongoingbacklogs = parseInt(e.ongoingbacklogs)) : (e.ongoingbacklogs = 0))
  res.send(studentdata)
})


exports.dashboard = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  ds = studentdata.filter((e) => placementstatus.some((d) => d.rollnumber == e.rollnumber))
  res.send({ data: placementstatus, total: studentdata.length, studentdata: ds })
})

exports.checkrollnumber = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { _id: 0 });
  res.send(placementstatus)
})

exports.checkmailnumber = (verifyToken, async (req, res) => {
  // console.log(req.body, ".......")

  // console.log(req.body,";;;;;;;;;;")
  let placementstatus = await manageData.getPlacementStatus('find', { mail: req.body.mail }, { _id: 0 });
  if (typeof (res) == 'object') {
    res.send(placementstatus)
  }
  else {
    return res(placementstatus)
  }
})

exports.notifyacceptreject = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  (placementstatus.message != 'error') ? (placementstatus == null ? (placementstatus = []) : null,
    (docs1 = placementstatus.filter((e) => (e.offerletter != "-" || e.offerletter != null) && (e.placed == "-"))),
    data = [],
    data = placementstatus.filter(d1 => (d1.placed == 'no' || d1.placed == 'yes' || d1.placed == 'onhold')),
    data.sort((a, b) => a.placeddate > b.placeddate ? 1 : -1),
    res.send({ data1: docs1, data2: data })) : res.send({ message: "error" })
})

exports.updateofferletter = (verifyToken, async (req, res, next) => {

  let placementstatusupdate = await manageData.updatePlacementStatus('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname }, req.body)
  res.send(placementstatusupdate)
})


exports.singlestudent = (verifyToken, async (req, res, next) => {

  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, rollnumber: req.body.rollnumber }, { _id: 0 });
  placementDetails.findOne(
    {
      organisation_id: req.body.organisation_id,
      placementcyclename: req.body.placementcyclename,
    },
    (epla, placename) => {
      if ((placementstatus != null && placementstatus.message != 'error' && placementstatus.length == 0) || !placementstatus[0].eligible) {
        const token = crypto.randomBytes(32).toString("hex")
        let mailDetails = {
          from: "Arikya",
          to: req.body.mail,
          subject: `Arikya- Open for Applications of ${req.body.companyname}`,
          html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
      <a href="http://localhost:4200/registration/${token}/${placename.placementcyclename}/${req.body.companyname}">click here</a> to register.
      For more details login to arikya</p><br/> Best Regards<br/> <b>Arikya<br/></b>`,
        }
        let c = {};
        c.companyname = req.body.companyname;
        c.companylocation = req.body.companylocation;
        c.placementcyclename = req.body.placementcyclename;
        c.registered = "no";
        c.organisation_id = req.body.organisation_id;
        c.placed = "-";
        c.date = new Date();
        c.token = token;
        c.package = "-";
        c.offerletter = "-";
        c.placeddate = "-";
        c.offerstatus = "-";
        c.offerdate = "-";
        c.verifiedoffer = "-";
        c.rejectedat = "-"
        c.placementcode = placename.code
        c.companycode = req.body.code
        c.type = req.body.type
        c.companylocation = "-";
        c.eligible = true
        c.rollnumber = req.body.rollnumber
        c.mail = req.body.mail
        let mailcontent = `Applications are now being accepted for ${req.body.companyname}
    Jobprofile :${req.body.companyprofiletitle} -${req.body.positiontype}
    click here to register.
    For more details login to arikya.
    Best Regards-Arikya`
        collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
        if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
        else {
          if (placementstatus.length != 0 && !placementstatus[0].eligible) {
            placementStatus.updateOne({ organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, rollnumber: req.body.rollnumber }, { $set: { eligible: true } }, (erru, docsu) => {
              res.send({ message: "success" })
            })
          }
          else {
            placementStatus.create(c, (errors, md) => {
              res.send({ message: 'success' })
            })
          }
        }
      }
      else if ((placementstatus.message != 'error' && placementstatus.length != 0) || placementstatus[0].eligible) {
        res.send({ message: 'exist' })
      }
    })
})






//send mail to arikya students based on registrations from home page
exports.homequery = (verifyToken, async (req, res, next) => {

  let mailDetails = {
    from: "Arikya",
    to: req.body.mails,
    subject: 'ARIKYA',
    html: req.body.content,
  }
  let mailcontent = req.body.content
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
  else { res.send({ message: 'success' }) }
})


exports.getHiring = (verifyToken, async (req, res, next) => {

  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename })
  var temp = []
  if (data.length > 0) {
    data.forEach(d => {
      if (!temp.includes(d.hiringflowname)) {
        temp.push(d.hiringflowname)
      }

    })
  }
  res.send(temp)
})



exports.singlemultipleoffers = (verifyToken, async (req, res, next) => {

  let placementdata = await placementStatus.find({ organisation_id: req.body.organisation_id, offerstatus: { $eq: 'yes' }, placementcyclename: req.body.placementcyclename }).distinct("rollnumber");
  let unique = [...new Set(placementdata)];
  let single = [], multiple = []
  if (unique.length > 0) {
    unique.forEach(async (value, index) => {
      let tempdata = placementdata.filter(str => str === value).length
      let studentdata = await studentData.findOne({ organisation_id: req.body.organisation_id, rollnumber: value })
      if (tempdata == 1) {
        single = [...single, [studentdata.firstname + " " + studentdata.middlename + " " + studentdata.lastname, value, studentdata.mail, studentdata.course, studentdata.department, studentdata.mobile, 1]]
      }
      else {
        multiple = [...multiple, [studentdata.firstname + " " + studentdata.middlename + " " + studentdata.lastname, value, studentdata.mail, studentdata.course, studentdata.department, studentdata.mobile, tempdata]]
      }

      if (index == unique.length - 1) {
        res.send({ singleoffer: single, multipleoffer: multiple })
      }
    })
  }
  else {
    res.send({ singleoffer: single, multipleoffer: multiple })
  }


})



exports.submitcompanystatus = (verifyToken, async (req, res, next) => {

  let otp = randomstring.generate(req.body.companyname.length)
  let mailDetails = {
    from: "Arikya",
    to: req.body.mail,
    subject: `Arikya- Otp to submit ${req.body.companyname}`,
    html: `<p>Requested to submit placement status for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
   ${otp} - is your code 
For more details login to arikya</p><br/> Best Regards<br/> <b>Arikya<br/></b>`,
  }
  let mailcontent = `Requested to submit placement status for ${req.body.companyname}
      Jobprofile : ${req.body.companyprofiletitle} - ${req.body.positiontype}

      Best Regards-Arikya`
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
  else {
    await manageData.updateCompanyDetails("updateOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { submitcode: otp });
    res.send({ message: "success" })
  }
})



exports.verifyOtp = (verifyToken, async (req, res, next) => {

  let data = await manageData.getCompanyDetails("findOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, submitcode: req.body.submitcodeentered });
  if (data) {
    const docs = await manageData.updateCompanyDetails("updateOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { status: "submitted" });
    // await manageData.updatePlacementStatus("updateMany", { organisation_id: req.body.organisation_id, placementcyclename: c.placementcyclename, companyname: c.companyname, registered: 'yes', eligible: true, placed: '-', rejectedat: "-" }, { offerstatus: 'offered' })
    res.send({ message: true })
  }

  else { res.send({ message: false }) }

})



exports.addIntoLevel = (verifyToken, async (req, res) => {

  // console.log(req.body, "add into levekl")
  req.body.forEach(async (e, i) => {

    let data = await manageData.getCompanyHirings("findOne", { organisation_id: e.organisation_id, placementcyclename: e.placementcyclename, companyname: e.companyname, hiringflowname: e.hiringflowname, rollnumber: e.rollnumber });

    if (!data) {

      let tempobject = { rejectedat: '-', placed: '-', offerstatus: '-' }
      if (e.lastItem) {
        tempobject = { offerstatus: 'offered', placed: '-' }
      }
      // console.log("add into levle", e)
      await manageData.postCompanyHirings('create', e)

      // console.log(tempobject, "accepted,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,", e, i, "indexxxxxxxxxxxxxx")
      await manageData.updatePlacementStatus("updateOne", { organisation_id: e.organisation_id, rollnumber: e.rollnumber, placementcyclename: e.placementcyclename, companyname: e.companyname }, tempobject)
    }
    if (i == req.body.length - 1) {

      res.send({ message: "success" })
    }
  })

})



exports.removeIntoLevel = (verifyToken, async (req, res) => {

  // console.log(req.body, "rejected")
  req.body.forEach(async (e, i) => {
    // console.log(e, "remove into level")
    // console.log(e.organisation_id, e.placementcyclename, e.companyname, e.hiringflowname, e.rollnumber, "rejecteddddddddddddddd")
    if (e.lastItem) {
      let tempobject = { offerstatus: 'notoffered', placed: '-' }
      await manageData.updatePlacementStatus("updateOne", { organisation_id: e.organisation_id, rollnumber: e.rollnumber, placementcyclename: e.placementcyclename, companyname: e.companyname }, tempobject)
    }
    let data = await manageData.getCompanyHirings("findOne", { organisation_id: e.organisation_id, placementcyclename: e.placementcyclename, companyname: e.companyname, hiringflowname: e.hiringflowname, rollnumber: e.rollnumber });
    // console.log(data, "....................................")
    if (data) {
      let s = await manageData.postCompanyHirings('deleteOne', e)
      // console.log(s)
    }
    // console.log(req.body)

    if (i == req.body.length - 1) {
      res.send({ message: "success" })
    }
  })
})
