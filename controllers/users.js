const Users = require("../models/users")
const Admin = require("../models/facultyData")
const Studentdata = require("../models/studentData")
const nodemailer = require("nodemailer")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const JWTSECRET = "amreenkousar"
const mailcollection = require("../models/mail")
const mail = require('./sendmail')
const data = require("../models/collegeData")
const manageData = require('./manageData')
const verifyToken = require('./verifyToken')


const encodeBuffer = (buffer) => buffer.toString("base64")
const encodeString = (string) => encodeBuffer(Buffer.from(string))
const encodeData = (data) => encodeString(JSON.stringify(data))
const encrypt = (data) => {
  if (Buffer.isBuffer(data)) return encodeBuffer(data)
  if (typeof data === "string") return encodeString(data)
  return encodeData(data)
}

exports.createPassword = (verifyToken, (req, res, next) => {
  req.body=JSON.parse(atob(req.body.data))
  req.body.password = bcryptjs.hashSync(req.body.password, 10);
  const tokenHashed = encrypt(jwt.sign({ subject: req.body.mail }, JWTSECRET))
  let mailDetails = {
    from: "Arikya",
    to: [req.body.mail],
    subject: `Registration confirmation - ARIKYA`,
    html: `
      <strong style="font-size:0.9rem">Thankyou for being awesome ! </strong>
      <br/><br/>
      <span style="font-size:0.9rem;line-height:20px">
      We are glad that you joined us. Happiness is not something you postpone for the future, it is something you design for the present. 
      <strong>For brighter tomorrow sign out of past and log in to ARIKYA .
      </strong></span>
      <br/><br/>
      Best Regards ,<br/>
      <strong>ARIKYA</strong> .      
      `,
  }
  let mailcontent = 'Registrations in arikya'

  Users.findOne({ mail: req.body.mail, organisation_id: req.body.organisation_id }, (err, docs) => {
    if (docs) {
      if (docs.password == "") {
        if (['admin', 'faculty', 'technicaltrainer'].includes(req.body.role)) {
          Admin.create(req.body, (err1, docs1) => {
            (err1) ? res.send({ message: 'user already exists' }) :
              Users.updateOne({ mail: req.body.mail, organisation_id: req.body.organisation_id }, { $set: req.body }, (err2, docs2) => {
                collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
                if (mail(mailDetails, collectmail)) {
                  res.send({ message: "poor connection" })
                } else {
                  res.send({ message: 'success', user: req.body.mail, token: tokenHashed })
                }
              })
          })
        }
        else if (req.body.role == 'student') {
          Studentdata.findOne({ mail: req.body.mail }, (err3, docs3) => {
            (!err3) ? (docs3) ?
              Studentdata.updateOne({ organisation_id: req.body.organisation_id, mail: req.body.mail }, { $set: req.body },
                function (err4, docs4) {
                  (err4) ? res.send({ message: 'user not enrolled' }) :
                    Users.updateOne({ mail: req.body.mail, organisation_id: req.body.organisation_id }, { $set: req.body }, (err5, docs5) => {
                      collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
                      if (mail(mailDetails, collectmail)) {
                        res.send({ message: "poor connection" })
                      } else {
                        res.send({ message: 'success', user: req.body.mail, token: tokenHashed })
                      }
                    })
                })
              : res.send({ message: 'user is not enrolled' })
              : res.send({ message: err })
          })
        }
        else {
          res.send({ message: "no role " })
        }
      }
      else { res.send({ message: "user not enrolled" }) }
    }
    else {
      res.send({ message: "user not enrolled" })
    }
  })
})

exports.findValidMail = async (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  const user = await Users.findOne({ 'mail': req.body.mail }).lean();
  if (user.password != '') {
    res.send({ message: 'success', organisation_id: user.organisation_id })
  }
  else if (user.password == '') {
    res.send({ error: "You did not signup yet !" })
  }
  else {
    res.send({ error: "Invalid mail" })
  }
}

exports.findoneUsers = async (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  const { mail, password } = req.body
  const user = await Users.findOne({ 'mail': mail }).lean();
  const tokenHashed = encrypt(jwt.sign({ subject: req.body.mail }, JWTSECRET))
  if (user) {
    // console.log(password, user.password)
    if (user.password) {
      (bcryptjs.compareSync(password, user.password)) ?
        (user.role !== 'student') ?
          Admin.findOne({ mail: user.mail }, (err, docs) => {
            (err) ? res.send(err) : (res.status(200).send({ 'token': tokenHashed, 'admindata': req.body.mail, 'status': 'ok', role: user.role, organisation_id: docs.organisation_id }))
          }) :
          Studentdata.findOne({ mail: req.body.mail }, (err, data) => {
            (err || !data) ? res.send({ status: 'error', error: 'Invalid mail' }) : (
              res.status(200).send({ 'token': tokenHashed, 'admindata': req.body.mail, 'status': 'ok', role: "student", organisation_id: data.organisation_id, login: data.dob }))
          })
        :
        res.json({ status: 'error', error: "Invalid password" })
    }
    else { res.send({ status: "error", error: "You did not signup yet" }) }
  }
  else {
    return res.json({ status: 'error', error: 'Invalid mail' })
  }
}



exports.findUsers = (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  Users.find({ organisation_id: req.body.organisation_id }, (err, docs) => {
    !err
      ? res.send(docs)
      :
      //  console.log(
      //   "Error while retrieving all records : " +
      //   JSON.stringify(err, undefined, 2)),
      null;
        
  })
}

exports.updateoneUsers = (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  Users.updateOne(
    { organisation_id: req.body.organisation_id, mail: req.body.mail },
    { $set: req.body },
    function (err, docs) {
      Admin.updateMany(
        { organisation_id: req.body.organisation_id, mail: req.body.mail },
        { $set: req.body },
        function (er1r, kkkk) {
          !err ? res.send({ msg: "successs" }) : console.log("error")
        }
      )
    }
  )
}

exports.changepassword = (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  passwordhashed = bcryptjs.hashSync(req.body.password, 10)
  Users.updateOne(
    { organisation_id: req.body.organisation_id, mail: req.body.mail },
    { $set: { password: passwordhashed } },
    function (err, docs) {
      (!err && docs.nModified != 0) ? (
        Users.findOne(
          { organisation_id: req.body.organisation_id, mail: req.body.mail }, (err, docs1) => {
            // console.log({ message: "success", role: docs1.role })
            res.send({ message: "success", role: docs1.role })
          })
      ) : res.send({ message: "error" })
    }
  )
}



exports.forgotpassword = (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  Users.findOne(
    { organisation_id: req.body.organisation_id, mail: req.body.mail },
    (err, docs) => {
      if (!err && docs != null) {
        var digits = "0123456789"
        var OTP = ""
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)]
        }
        let mailDetails = {
          from: "placementscycle@mail.com",
          to: docs.mail,
          subject: "Verification code - ARIKYA ",
          html: `<p>Hey forgot password !
          <strong> ${OTP}</strong> is the your verification code . </p>
          <br/>
          <br/>
          Best Regards ,
          <br/><strong>ARIKYA</strong>`,
        }
        let mailcontent = `Hey ! ${OTP} is the OTP .`
        collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
        if (mail(mailDetails, collectmail)) { res.send({ 'error': 'Connection is poor' }) } else { res.send({ 'otp': OTP }); }
      } else {
        res.send({ error: "error" })
      }
    }
  )
}








exports.feedmail = (req, res) => {
  req.body=JSON.parse(atob(req.body.data))
  let mailDetails = {
    from: "Arikya",
    to: ['shaikamreenkousar@gmail.com', 'harshapriya054@gmail.com', '19691a0559@Arikya.ac.in'],
    subject: `Feedback - ARIKYA`,
    html: `${req.body.feed} by ${req.body.name} ${req.body.mail}`,
  }
  res.send(mail(mailDetails))
}
