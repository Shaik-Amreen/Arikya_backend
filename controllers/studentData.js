
const verifyToken = require("./verifyToken")
const mail = require("./sendmail")
const manageData = require('./manageData')
const Studentdata = require('../models/studentData')
const Users = require('../models/users')
var randomstring = require("randomstring")
const nodemailer = require("nodemailer")
const placementstatus = require("./placementStatus")
const dashbaord = require("./dashboard")


const filterPlacementdata = async (docstu, placementcyclename) => {
  let eligible = docstu
  let notaddedstudents = await docstu.filter(ad => ad.eligibleplacementcycles.flat().every(fd => fd.placementcyclename !== placementcyclename))
  let addedstudents = await docstu.filter(ad => notaddedstudents.every(fd => fd.rollnumber != ad.rollnumber))
  let interested = await addedstudents.filter(ad => ad.eligibleplacementcycles.flat().some(fd => (fd.placementcyclename == placementcyclename && fd[placementcyclename] == 'yes')))
  let notinterested = await addedstudents.filter(ad => ad.eligibleplacementcycles.flat().some(fd => fd.placementcyclename === placementcyclename && fd[placementcyclename] != "yes"))
  eligible.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  addedstudents.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  interested.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  notinterested.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  notaddedstudents.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  return [eligible, notaddedstudents, addedstudents, interested, notinterested];
}

const filterPlacementStatus = async (organisation_id, placementcyclename, docstu) => {
  let placementStatusData = await manageData.getPlacementStatus('find', { placementcyclename: placementcyclename, organisation_id: organisation_id }, { _id: 0 })
  let placedmain = await docstu.filter(d => placementStatusData.some(p => (p.placed == 'yes' && d.mail == p.mail)))
  let offeredmain = await docstu.filter(d => placementStatusData.some(p => (p.offerstatus == 'yes' && d.mail == p.mail)))
  let comregistermain = await docstu.filter(d => placementStatusData.some(p => (p.registered == 'yes' && d.mail == p.mail)))
  let comnotregistermain = await docstu.filter(d => placementStatusData.some(p => (p.registered != 'yes' && d.mail == p.mail)))
  let placed = placedmain.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  let offered = offeredmain.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  let comregister = comregistermain.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  let comnotregister = comnotregistermain.filter((v, i, a) => a.findIndex(v2 => (v2.mail === v.mail)) === i)
  return [placed, offered, comregister, comnotregister, placedmain, offeredmain, comregistermain, comnotregistermain, placementStatusData]
}


exports.findcollegestudents = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id }, { _id: 0, firstname: 1, rollnumber: 1, mail: 1, mobile: 1, verified: 1 })
  let collegedata = await manageData.getCollegeData('findOne', { organisation_id: req.body.organisation_id }, { _id: 0, organisation: 1 })
  res.send({ data: studentdata, collegedata: collegedata })
})

exports.findstudentdetails = (verifyToken, async (req, res, next) => {

  let data2, data3
  let studentdata = await manageData.getStudentData('findOne', { organisation_id: req.body.organisation_id, mail: req.body.mail }, { _id: 0 })
  if (req.body.query2 && req.body.query3 && req.body.query3 == "stdprofilerating" && req.body.query2 == "placementstatusmail") {
    await placementstatus.checkmailnumber(req, (data) => { data2 = data })
    // await dashbaord.stdprofilerating(req, (data) => { data3 = data })
    res.send({ data: studentdata, data2: data2, data3: data3 })
  }
  else {
    res.send({ data: studentdata })
  }
})

exports.findbyrollnumber = (verifyToken, async (req, res, next) => {

  // console.log(req.body)
  let studentdata = await manageData.getStudentData('findOne', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { _id: 0 })
  let placementstatus = await manageData.getPlacementStatus('findOne', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, { eligible: 1 })
  if (placementstatus && studentdata) {
    studentdata = { ...studentdata, ...placementstatus }
  }
  else if (studentdata) {
    studentdata = { ...studentdata, ...{ eligible: '-' } }
  }
  res.send({ data: studentdata })
})

exports.updatestudentdatac = (verifyToken, async (req, res, next) => {

  // console.log(req.body)
  let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail }, req.body)
  // res.send(studentdata)
})

exports.storefile = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail }, { [req.body.filename]: req.body.filedata })
  res.send(studentdata)
})


exports.updateverified = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { verified: req.body.verified })
  res.send(studentdata)
})

exports.askfreeze = (verifyToken, async (req, res, next) => {

  let mailDetails = {
    from: "Arikya",
    to: [req.body.mail],
    subject: `REJECTION OF PROFILE - ARIKYA`,
    html: `
      <span style="font-size:0.9rem;line-height:20px">
      Your profile has been  <b>REJECTED . </b> Please refer <b>placements cell </b> as soon as possible .
      You will not recieve any updates regarding placements till your profile is accepted .
      </span>
      <br/><br/>  
      Best Regards ,<br/>
      <strong>ARIKYA</strong> .      
      `,
  }

  let mailcontent = "Your profile has been  REJECTED . Please refer Arikya.You will not recieve any updates regarding placements till your profile is accepted . Arikya. Placements cycle ."
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  if (mail(mailDetails, collectmail)) {
    // console.log('Error Occurs', err);
  } else {
    let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { verified: req.body.verified, freeze: req.body.freeze })
    res.send(studentdata)
  }
})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

exports.createStudentdata = (verifyToken, async (req, res, next) => {

  // console.log("req.body", req.body)
  let user
  let sran = ""
  let mailTransporter = nodemailer.createTransport({
    // service: "gmail.com",
    auth: {
      user: "arikya.hackgmail.com",
      pass: "msatbnhnozoxvksu",
    },
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL,
    pool: true,
    tls: {
      rejectUnauthorized: false,
      secureProtocol: "TLSv1_method",
    },
  })
  req.body = req.body.filter((e) => e.rollnumber != null)
  // console.log(req.body, "req.body1111")
  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body[0].organisation_id }, { _id: 0, mail: 1, rollnumber: 1 });
  // console.log("studentdata", studentdata)
  req.body = req.body.filter(({ rollnumber }) => !studentdata.some((x) => x.rollnumber == rollnumber));
  // console.log("req.body222222", req.body)
  if (req.body.length > 0) {
    // console.log("2222222222222222222222222222222")
    req.body.forEach(async (c, i) => {
      // console.log("111111111111111111111111111111111")
      c.code = c.rollnumber + c.organisation_id
      function shuffleArray(arr) {
        arr.sort(() => Math.random() - 0.5);
        return arr
      };

      c.code = shuffleArray([...c.code]);
      c.code = c.code.join("")
      // console.log(c.code)
      createuser = new Users(c)
      createuser.save()
      user = new Studentdata(c)
      user.save(function (err, results) { })
      let mailDetails =
      {
        from: "arikya.hak@gmail.com",
        to: [c.mail],
        subject: `Hurry ! to sign up - ARIKYA`,
        html: `
          <strong style="font-size:0.9rem">Greetings from ARIKYA ! </strong>
          <br/><br/>
          <span style="font-size:0.9rem;line-height:20px">
          Wanna enlight your future in co-orperate world ? Consider <strong> ARIKYA </strong>
          your first priority .
          Hurry up ! don't wait .. time will never be perfect.
          <br/>
          <span><strong>Registration Link : <a href="https://arikya.herokuapp.com">ARIKYA</a> </strong><span><br/>
          <span><strong>Passcode<strong> : ${c.code}</span>
          </span>
          <br/><br/>
          Best Regards ,<br/>
          <strong>ARIKYA</strong> .      
          `
      }
      mailcontent = mailDetails.html
      collectmail = { organisation_id: req.body[0].organisation_id, content: mailcontent, subject: mailDetails.subject }


      // console.log("ok")

      setTimeout(() => {
        sendmail();
      }, 1000 * i);

      function sendmail() {
        mailTransporter.sendMail(mailDetails, function (err7, data) {
          // console.log(err7, data)

          if (err7) {
            return true
          }
          else {
            if (i == req.body.length - 1) {
              res.send({ message: "success" })
            }

            // mailDetails.to.forEach(m => {
            //   collectmail.to = m
            //   mailcollection.create(collectmail, (er, d) => {
            //     er ? console.log(er) : console.log('mail stored:', d)
            //   })
            // })
            // return false
          }
        })
      }



      // console.log("okend ,,,,,,,,,,,,,")


      // if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
      // else {
      //   console.log("success full mail")
      //   // await manageData.postMail('create', { organisation_id: req.body[0].organisation_id, content: mailDetails, subject: mailDetails.subject });
      // }

    })
  } else {
    // console.log("hello")
    res.send({ message: "success" })
  }
})

exports.askunfreeze = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { verified: req.body.verified, freeze: req.body.freeze })
  res.send(studentdata)
})

exports.updatedemoteyear = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, currentyear: req.body.currentyear, course: req.body.course, }, { currentyear: req.body.present })
  res.send(studentdata)
})

exports.updatedemoteyearstudent = (verifyToken, async (req, res, next) => {

  req.body.data.forEach(async (c, i) => {
    let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, currentyear: { $ne: "1" }, currentyear: req.body.present }, { currentyear: data.currentyear - 1 })
    if (i + 1 == req.body.data.length) {
      res.send(studentdata)
    }
  })
})



exports.updatebacklogs = async (req, res, next) => {

  req.body.data.forEach(async (c, i) => {
    let studentdata = await manageData.updateStudentData('updateMany', { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber }, { ongoingbacklogs: c.ongoingbacklogs, totalbacklogs: c.totalbacklogs })
    if (i + 1 == req.body.data.length) {
      res.send(studentdata)
    }
  })
}

exports.updatemarks = async (req, res, next) => {

  const seme = req.body.sem
  req.body.data.forEach(async (c, i) => {
    let studentdata = await manageData.getStudentData('findOne', { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber }, { _id: 0, sgpa: 1, rollnumber: 1 })
    if (studentdata != null) {
      if (studentdata.sgpa.length == 0) {
        studentdata.sgpa.push({ [seme]: c.sgpa })
      }
      else {
        let ex = studentdata.sgpa.flat(1)
        let kel = []
        ex.forEach((k) => {
          kel.push(...Object.keys(k))
        })
        if (kel.indexOf(seme) != -1) {
          let ins = kel.indexOf(seme)
          studentdata.sgpa[ins][seme] = c.sgpa
        } else {
          studentdata.sgpa.push({ [seme]: c.sgpa })
        }
      }
      let studentupdate = await manageData.updateStudentData('updateMany', { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber }, { sgpa: studentdata.sgpa, cgpa: c.cgpa })
      if (i + 1 == req.body.data.length) {
        res.send(studentupdate)
      }
    }
    else if (i == req.body.data.length - 1) {
      res.send({ message: "success" })
    }
  })
}

exports.updateyear = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.updateStudentData('updateMany', { organisation_id: req.body.organisation_id, currentyear: req.body.currentyear, course: req.body.course }, { currentyear: req.body.present })
  res.send(studentdata)
})

exports.addstudentstoplacementcycle = (verifyToken, async (req, res, next) => {

  if (req.body.notaddestudents.length == 0) {
    return res.send({ message: "success" })
  }
  else {

    req.body.notaddestudents.forEach(async (s, i) => {
      if (!s.eligibleplacementcycles.includes({ placementcyclename: req.body.placementcyclename, [req.body.placementcyclename]: '' })) { s.eligibleplacementcycles.push({ placementcyclename: req.body.placementcyclename, [req.body.placementcyclename]: '' }) }
      let studentupdate = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, rollnumber: s.rollnumber }, { eligibleplacementcycles: s.eligibleplacementcycles })
      if (i + 1 == req.body.notaddestudents.length) {
        res.send(studentupdate)
      }
    })
  }
})

exports.studentsplacementaddedstatus = async (req, res, next) => {

  let docs = await manageData.getPlacementDetails('findOne', { placementcyclename: req.body.placementcyclename, organisation_id: req.body.organisation_id }, { batch: 1, _id: 0 })
  docs = await docs.batch.flat().map(a => parseInt(a.batchvalue) - 4);
  // console.log(docs)
  const docstu = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id, yearofjoining: { "$in": docs } })
  // console.log(docstu)
  let [eligible, notaddedstudents, addedstudents, interested, notinterested] = await filterPlacementdata(docstu, req.body.placementcyclename)
  res.send({ eligible: eligible, addedstudents: addedstudents, interested: interested, notinterested: notinterested, notaddedstudents: notaddedstudents })
}

exports.pendinginvitations = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id }, { _id: 0 })
  let pending = studentdata.filter(e => e.dob == '')
  let registered = studentdata.filter(e => e.dob != '')
  res.send({ pending: pending, total: studentdata, registered: registered })
})

exports.mailtoregisterstudents = (verifyToken, async (req, res, next) => {

  let mailist = []
  req.body.forEach(e => mailist.push(e.mail))
  let mailDetails = {
    from: "Arikya",
    to: mailist,
    subject: `Hurry ! to sign up - ARIKYA`,
    html: `
      <strong style="font-size:0.9rem">Greetings from ARIKYA ! </strong>
      <br/><br/>
      <span style="font-size:0.9rem;line-height:20px">
     Did not register ARIKYA yet ! 
      Hurry up ! don't wait .. time will never be perfect.
    <br/>
      <span><strong>Registration Link : <a href="https://arikya.herokuapp.com">ARIKYA</a> </strong><span>
      </span>
      <br/><br/>
      Best Regards ,<br/>
      <strong>ARIKYA</strong> .      
      `,
  }
  let mailcontent = mailDetails.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }

  if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
  else {
    res.send({ message: 'success' })
  }
})

exports.studentplacementinterest = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.getStudentData('findOne', { mail: req.body.mail, organisation_id: req.body.organisation_id }, { _id: 0, eligibleplacementcycles: 1 })
  // console.log("studentdata.eligibleplacementcycles", studentdata)
  let data2
  if (req.body.query2 && req.body.query2 == "placementstatusmails") {
    await placementstatus.checkmailnumber(req, (data) => { data2 = data })
    if (studentdata) {
      res.send({ data1: studentdata.eligibleplacementcycles.flat(), data2: data2 })
    }
    else {
      res.send({ data1: [], data2: data2 });
    }
  }
  else {
    if (studentdata) {
      res.send({ data1: studentdata.eligibleplacementcycles.flat() })
    }
    else {
      res.send({ data1: [] });
    }
  }
})

exports.studentupdateinterest = (verifyToken, async (req, res, next) => {

  let studentdata = await manageData.updateStudentData('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail }, { eligibleplacementcycles: req.body.eligibleplacementcycles })
  res.send(studentdata)
})

exports.dashboardcampusreports = async (req, res, next) => {


  let docsmain = await manageData.getPlacementDetails('find', { organisation_id: req.body.organisation_id }, { _id: 0, code: 0, type: 0 })
  let docs = [], response = []
  if (docsmain.length > 0) {
    docsmain.forEach(async (doc, i) => {
      docs = await doc.batch.flat().map(a => parseInt(a.batchvalue) - 4);
      let companies = await manageData.getCompanyDetails('find', { organisation_id: req.body.organisation_id, placementcyclename: doc.placementcyclename }, { companyname: 1, placementcyclename: 1 })
      companies = companies.reverse()
      const docstu = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id, yearofjoining: { "$in": docs } })
      let [eligible, notaddedstudents, addedstudents, interested, notinterested] = await filterPlacementdata(docstu, doc.placementcyclename);
      let companydata = []
      let [placed, offered, comregister, comnotregister, placedmain, offeredmain, comregistermain, comnotregistermain, placements] = await filterPlacementStatus(req.body.organisation_id, doc.placementcyclename, docstu);

      companies.forEach(async (c, i) => {
        let companyPlacementStatus = placements.filter(e => (c.companyname == e.companyname && c.placementcyclename == e.placementcyclename))
        let placedcompany = docstu.filter(d => companyPlacementStatus.some(p => p.placed == 'yes' && p.mail == d.mail))
        let offeredcompany = docstu.filter(d => companyPlacementStatus.some(p => (p.offerstatus == 'offered' || p.offerstatus == 'accepted') && p.mail == d.mail))
        let comregistercompany = docstu.filter(d => companyPlacementStatus.some(p => p.registered == 'yes' && p.mail == d.mail))
        let comnotregistercompany = docstu.filter(d => companyPlacementStatus.some(p => p.registered != 'yes' && p.mail == d.mail))
        companydata = [...companydata, { placedcompany: placedcompany, offeredcompany: offeredcompany, comregistercompany: comregistercompany, comnotregistercompany: comnotregistercompany, companyname: c.companyname, companyPlacementStatus: companyPlacementStatus }]
      })
      response = await [...response, {
        eligible: eligible, addedstudents: addedstudents, interested: interested, notinterested: notinterested, notaddedstudents: notaddedstudents, placementcyclename: doc.placementcyclename, fromdate: doc.fromdate, todate: doc.todate,
        placed: placed, offered: offered, comregister: comregister, comnotregister: comnotregister, placedmain: placedmain, offeredmain: offeredmain, comregistermain: comregistermain, comnotregistermain: comnotregistermain,
        companies: companydata
      }];

      if (response.length == docsmain.length) {
        res.send({ response: response, placementcycles: docsmain })
      }
    })
  }
  else {
    res.send({
      response: {
        eligible: [], addedstudents: [], interested: [], notinterested: [], notaddedstudents: [], placementcyclename: [].placementcyclename, fromdate: [].fromdate, todate: [].todate,
        placed: [], offered: [], comregister: [], comnotregister: [], placedmain: [], offeredmain: [], comregistermain: [], comnotregistermain: [],
        companies: []
      }, placementcycles: []
    })
  }
}




exports.verifyStudent = (verifyToken, async (req, res) => {

  let docs = await manageData.getPlacementDetails('findOne', { placementcyclename: req.body.placementcyclename, organisation_id: req.body.organisation_id }, { batch: 1, _id: 0 })
  docs = await docs.batch.flat().map(a => parseInt(a.batchvalue) - 4);
  await manageData.updateStudentData('updateMany', { organisation_id: req.body.organisation_id, yearofjoining: { "$in": docs } }, { verified: 'yes' })
  res.send({ message: "success" })
})