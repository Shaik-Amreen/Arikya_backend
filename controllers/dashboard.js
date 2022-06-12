const Studentdata = require("../models/studentData")
const Practice = require("../models/codeQuiz")
const codequiz = require("./codeQuiz")
const { count } = require("console")
const manageData = require("./manageData")
const verifyToken = require("./verifyToken")

dashboarcodedata = (verifyToken, async (req, res) => {

  await codequiz.flushquizrating(req.body.organisation_id, "code", req.body.createdby, (doc) => { })
  doc = await manageData.getCodeQuiz("find", req.body)
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); let main = [], branch = ["cse", "ece", "eee", "mech", "civil", "cst", "mba", "mca",], hell = [], sum, a, tempdata = {}
  doc1.map((d) => doc.map((documents) => documents.ratings.map((e) => e.mail == d.mail && main.push({ dept: d.department, ...e }))))
  branch.map((e) => ((sum = 0), (a = []), (a = main.filter((s) => s.dept == e)), a.map((ad) => (sum = sum + parseFloat(ad.main))),
    sum > 0 ? hell.push({ type: e, rating: (sum / a.length).toFixed(2), attended: a.length, }) : hell.push({ type: e, rating: 0 })))
  branch.map((e) => {
    mails = []
    conclude = []
    main.map((m) =>
      !mails.includes(m.mail) && m.dept == e ? mails.push(m.mail) : null
    )
    mails.forEach((g, i) => {
      sum = 0
      a = []
      a = main.filter((el) => el.mail == g)
      a.map((ad) => (sum = sum + parseFloat(ad.main)))
      b = g.split("@")
      conclude.push({
        roll: b[0],
        rate: (sum / a.length).toFixed(2),
      })
    })
    tempdata[e] = conclude
  })
  res.send({ message: hell, data: tempdata })
})

dashboarquizdata = (verifyToken, async (req, res) => {

  await codequiz.flushquizrating(req.body.organisation_id, "quiz", req.body.createdby, async (doc) => { })
  doc = await manageData.getCodeQuiz("find", req.body)
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id });
  let main = [], branch = ["cse", "ece", "eee", "mech", "civil", "cst", "mba", "mca"], hell = [], sum, a, tempdata = {}
  doc1.map((d) => doc.map((documents) => documents.ratings.map((e) => e.mail == d.mail && main.push({ dept: d.department, ...e }))))
  branch.map(
    (e) => (
      (sum = 0),
      (a = []),
      (a = main.filter((s) => s.dept == e)),
      a.map((ad) => (sum = sum + parseFloat(ad.main))),
      sum > 0 ? hell.push({ type: e, rating: (sum / a.length).toFixed(2), attended: a.length, }) : hell.push({ type: e, rating: 0 })
    )
  )
  branch.map((e) => {
    ; (mails = []), (conclude = [])
    main.map((m) =>
      !mails.includes(m.mail) && m.dept == e ? mails.push(m.mail) : null
    )
    mails.forEach((g, i) => {
      sum = 0
      a = []
      a = main.filter((el) => el.mail == g)
      a.map((ad) => (sum = sum + parseFloat(ad.main)))
      b = g.split("@")
      conclude.push({
        roll: b[0],
        rate: (sum / a.length).toFixed(2),
      })
    })
    tempdata[e] = conclude
  })
  res.send({ message: hell, data: tempdata })

})

totaldata = (verifyToken, async (req, res) => {

  // console.log(req.body)
  await codequiz.flushquizrating(req.body.organisation_id, "codequiz", req.body.createdby, (doc) => { })
  doc = await manageData.getCodeQuiz("find", req.body);
  // console.log(doc)
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); let main = [], branch = ["cse", "ece", "eee", "mech", "civil", "cst", "mba", "mca"], hell = []
  doc1.map((d) =>
    doc.map((documents) =>
      documents.ratings.map((e) => e.mail == d.mail ? main.push({ dept: d.department, ...e }) : null)))
  let sum,
    a,
    tempdata = {}
  branch.map(
    (e) => (
      (sum = 0),
      (a = []),
      (a = main.filter((s) => s.dept == e)),
      a.map((ad) => (sum = sum + parseFloat(ad.main))),
      sum > 0
        ? hell.push({
          type: e,
          rating: (sum / a.length).toFixed(2),
        })
        : hell.push({ type: e, rating: 0 })
    )
  )
  branch.map((e) => {
    mails = []
    conclude = []
    main.map((m) =>
      !mails.includes(m.mail) && m.dept == e ? mails.push(m.mail) : null
    )
    mails.forEach((g, i) => {
      sum = 0
      a = []
      a = main.filter((el) => el.mail == g)
      a.map((ad) => (sum = sum + parseFloat(ad.main)))
      b = g.split("@")

      conclude.push({
        roll: b[0],
        rate: (sum / a.length).toFixed(2),
      })
    })
    tempdata[e] = conclude
  })
  res.send({ message: hell, data: tempdata })
})

eachtestratings = (verifyToken, async (req, res) => {

  doc = await manageData.getCodeQuiz("find", req.body)
  if (doc) {
    doc = doc.filter(e => new Date(e.startson) <= new Date())
  }
  if (doc.length != 0) {
    let data = []
    ratings = doc[0].ratings
    if (ratings) {
      ratings.forEach((a) => {
        let x = {}
        x.mail = a.mail
        // console.log(typeof (a.main))
        x.main = Number(a.main).toFixed(3)
        data.push(x)
      });
    }
    let data1 = []
    doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); doc1.map((d) =>
      data.map((d1) => {
        d1.mail == d.mail
          ? (data1.push({ firstname: d.firstname, lastname: d.lastname, middlename: d.middlename, dept: d.department, topic: req.body.topic, rollno: d.rollnumber, course: d.course, currentyear: d.currentyear, ...d1 }))
          : null
      }))
    data1.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
    data1.map((x, index) => {
      x.rank = index + 1
    })
    if (typeof (res) == 'object') {
      res.send({ data: data1 })
    }
    else {
      return res(data1)
    }
  }
})

alltestratings = (verifyToken, async (req, res) => {

  doc = await manageData.getCodeQuiz("find", req.body)
  data = []
  datamails = []
  // console.log("doc", doc)
  if (doc) {
    doc = doc.filter(e => new Date(e.startson) <= new Date())
  }
  if (doc && doc.length > 0) {
    await doc.forEach(async z => {
      // console.log(new Date(z.startson), new Date())
      let a = z.ratings
      if (a)
        await a.forEach(async y => {
          let count = 1
          if (datamails.includes(y.mail)) {
            i = data[data.findIndex(x => x.mail === y.mail)]
            i.count++
            i.topics.push(z.topic)
            i.mainrates.push(y.main)
            i.main = ((parseFloat(i.main) + parseFloat(y.main))).toString();
          }
          else {
            let x = {}
            x.mail = y.mail
            x.main = y.main
            x.topics = [z.topic]
            x.mainrates = [y.main]
            x.count = 1
            data.push(x)
            datamails.push(x.mail)
          }
          count++;
        });
    });
  }
  // console.log(data,"data111111111------->")
  if (data) {
    await data.forEach((a, i) => {
      // console.log("data[i]1111", data[i]);
      data[i].main = (parseFloat(data[i].main) / doc.length).toFixed(3);
      data[i].total = doc.length;
      // console.log("data[i]22222", data[i])
    })
  }
  // console.log(data, "data22222222222------->")
  alldata = data
  let data1 = []
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }, { 'mail': 1, 'firstname': 1, 'lastname': 1, 'middlename': 1, 'department': 1, 'rollnumber': 1, 'course': 1, 'currentyear': 1, });
  // console.log(alldata, "alldata2222222------->")
  await doc1.forEach(async (d) =>
    await alldata.forEach(async (dat) => {
      // console.log("dat.mail,d.mail", dat.mail, d.mail)
      await dat.mail == d.mail
        ? ((data1.push({ firstname: d.firstname, lastname: d.lastname, middlename: d.middlename, dept: d.department, rollno: d.rollnumber, course: d.course, currentyear: d.currentyear, ...dat })))
        : null
    }
    )
  )

  data1.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
  data1.map((x, index) => {
    x.rank = index + 1
  })
  if (typeof (res) == 'object') {
    res.send({ data: data1 })
  }
  else {
    return res(data1)
  }
})


stdprofilerating = (verifyToken, async (req, res) => {

  // console.log(req)
  let stdallratedata = {}, stdallcodedata = {}, stdallquizdata = {}, stdeachcoderate = [], stdeachquizrate = [];
  // console.log("to the student profile ratings")
  // var start_time = new Date().getTime();
  await allcodequiztestratings(req, async (data) => {
    data.map((a) => { (a.mail == req.body.mail) ? stdallratedata = a : null; })
  })
  // var end_date = new Date().getTime();
  // console.log(start_time-end_time,"done with allcodequiztestratings")
  // console.log("done with allcodequiztestratings")
  req.body.type = 'quiz'
  await alltestratings(req, (data1) => {
    data1.map((a) => { (a.mail == req.body.mail) ? stdallquizdata = a : null; });
    if (stdallquizdata && stdallquizdata.topics) {
      stdallquizdata['topics'].map((t, index) => { req.body.topic = t })
    }
  })
  // var start_time = new Date().getTime();
  // console.log(end_time-start_time,"done with alltestratings")
  // console.log("done with alltestratings")
  await eachtestratings(req, (data2) => {
    data2.map((a) => { (a.mail == req.body.mail) ? stdeachquizrate.push(a) : null; })
  })
  // var end_time = new Date().getTime();
  // console.log(start_time-end_time,"done with eachtestratings")
  // console.log("done with eachtestratings")
  req.body.type = 'code'
  await alltestratings(req, (data1) => {
    data1.map((a) => { (a.mail == req.body.mail) ? stdallcodedata = a : null; })
    stdallcodedata && stdallcodedata.topics && stdallcodedata.topics.map((t, index) => { req.body.topic = t })
  })
  // var start_time = new Date().getTime();
  // console.log(end_time-start_time,"done with alltestratings")
  // console.log("done with alltestratings")
  await eachtestratings(req, (data2) => {
    data2.map((a) => { (a.mail == req.body.mail) ? stdeachcoderate.push(a) : null; })
  })
  // var end_time = new Date().getTime();
  // console.log(start_time-end_time,"response captured")
  // console.log("stdallratedata,stdallcodedata, stdeachcoderate,stdallquizdata, stdeachquizrate", stdallratedata, stdallcodedata, stdeachcoderate, stdallquizdata, stdeachquizrate)
  // console.log("response captured")
  data = { stdallratedata: stdallratedata, stdallcodedata: stdallcodedata, stdeachcoderate: stdeachcoderate, stdallquizdata: stdallquizdata, stdeachquizrate: stdeachquizrate }
  if (typeof (res) == 'object') {
    res.send(data)
  }
  else {
    return res(data)
  }
})


allcodequiztestratings = (verifyToken, async (req, res) => {

  var data1 = []
  //it flush all pending quiz ratings and then procced for all code and quiz ratings
  // console.log("start with flush")
  await codequiz.flushquizrating(req.body.organisation_id, "codequiz", req.body.createdby, (doc) => { })
  // console.log("end with flush")
  doc = await manageData.getCodeQuiz("find", req.body);
  data = []
  if (doc) {
    // console.log("docstart")
    doc = doc.filter(e => new Date(e.startson) <= new Date())
    // console.log("docsend")
  }
  // console.log("start")
  if (doc && doc.length > 0) {
    await doc.map(z => {
      let a = z.ratings
      // console.log("aaaaaaaaaaaaaaa", a)
      if (a)
        a.map(y => {
          if (!data.find(x => x.mail === y.mail)) {
            let x = {}
            x.mail = y.mail
            x.main = y.main
            x.topics = [z.topic]
            x.mainrates = [y.main]
            x.count = 1
            x.total = doc.length
            data.push(x)
          }
          else {
            i = data[data.findIndex(x => x.mail === y.mail)]
            i.count++
            i.topics.push(z.topic)
            i.mainrates.push(y.main)
            i.main = ((parseFloat(i.main) + parseFloat(y.main))).toString();
          }
        });
    });
  }
  // console.log("end")
  if (data) { data.map((a) => a.main = (parseFloat(a.main) / doc.length).toFixed(3)) }
  else { data = [] }
  data1 = []
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id });
  (!doc1) ? doc1 = [] : null;
  doc1.map((d) =>
    data.map((d1) => {
      d1.mail == d.mail
        ? (data1.push({ firstname: d.firstname, lastname: d.lastname, middlename: d.middlename, dept: d.department, rollno: d.rollnumber, course: d.course, currentyear: d.currentyear, ...d1 }))
        : null
    }
    )
  )
  data1.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
  data1.map((x, index) => {
    x.rank = index + 1
  })
  // console.log("done the logic")
  if (typeof (res) == 'object') {
    res.send({ data: data1 })
  }
  else {
    return res(data1)
  }
})

module.exports = {
  dashboarcodedata,
  dashboarquizdata,
  totaldata,
  eachtestratings,
  alltestratings,
  stdprofilerating,
  allcodequiztestratings
}


// stdprofilerating = (verifyToken, async (req, res) => {       req.body=JSON.parse(atob(req.body.data))
//   let stdallratedata, stdallcodedata, stdallquizdata, stdeachcoderate = [], stdeachquizrate = [];
//   try {
//     await allcodequiztestratings(req, (data) => {
//       data.map((a) => { (a.mail == req.body.mail) ? stdallratedata = a : null; })
//       req.body.type = 'quiz'
//       alltestratings(req, (data1) => {
//         data1.map((a) => { (a.mail == req.body.mail) ? stdallquizdata = a : null; });
//         (stdallquizdata) ?
//           stdallquizdata['topics'].map((t, index) => {
//             req.body.topic = t
//             console.log("kwjb")
//             eachtestratings(req, (data2) => {
//               data2.map((a) => { (a.mail == req.body.mail) ? stdeachquizrate.push(a) : null; })
//               console.log("stdeachquizrate", stdeachquizrate)
//               if (stdallquizdata.topics.length - 1 == index) {
//                 req.body.type = 'code'
//                 alltestratings(req, (data1) => {
//                   data1.map((a) => { (a.mail == req.body.mail) ? stdallcodedata = a : null; })
//                   stdallcodedata.topics.map((t, index) => {
//                     req.body.topic = t
//                     eachtestratings(req, (data2) => {
//                       data2.map((a) => { (a.mail == req.body.mail) ? stdeachcoderate.push(a) : null; })
//                       console.log("stdeachcoderate", stdeachcoderate)
//                       if (stdallcodedata.topics.length - 1 == index) {
//                         res.send({ stdallratedata: stdallratedata, stdallcodedata: stdallcodedata, stdeachcoderate: stdeachcoderate, stdallquizdata: stdallquizdata, stdeachquizrate: stdeachquizrate })
//                       }
//                     })
//                   })
//                 })
//               }
//             })
//           }) : null;
//       })


//     })


//   }
//   catch (error) {
//     console.log("error", error)
//   }

//   // console.log("stdallcodedata",stdallcodedata)

//   // req.body.type='quiz'
//   // await alltestratings(req,(data1)=>{
//   //   data1.map((a)=>{(a.mail==req.body.mail)? stdallquizdata = a:null;})
//   //   stdallquizdata.topics.map((t)=>{
//   //     req.body.topic=t
//   //     eachtestratings(req,(data2)=>{
//   //       data2.map((a)=>{(a.mail==req.body.mail)? stdeachquizrate.push(a):null;})
//   //     })
//   //   })
//   // })

//   // console.log("stdallquizdata",stdallquizdata,"stdallquizdata")
//   // res.send({stdallratedata:stdallratedata,stdallcodedata:stdallcodedata,stdallquizdata:stdallquizdata,stdeachcoderate:stdeachcoderate,stdeachquizrate:stdeachquizrate})

// })