const Practice = require("../models/codeQuiz")
const fs = require("fs")
let { PythonShell } = require("python-shell")
const compiler = require('compile-code');
const Axios = require("axios");
const codequiz1 = require("./codeQuiz");
const { callbackify } = require("util");
const verifyToken = require("./verifyToken")
const manageData = require('./manageData');
const { createCodeFile } = require("./createCodeFile");
const { executeJava, executePython, executeCorCPP } = require("./executeCode");

uploadpractice = (verifyToken, async (req, res) => {

  data1 = await manageData.getCodeQuiz("findOne", { college_id: req.body.college_id, topic: req.body.topic, type: req.body.type });
  if (data1) res.send({ message: "Test topic name already exists" });
  else {
    data2 = await manageData.postCodeQuiz("create", req.body);
    if (data2) res.status(200).send({ message: "success" });
  }
})

editpractice = (verifyToken, async (req, res) => {

  // console.log("1",req.body.ratings)
  if (new Date(req.body.endson) > new Date()) {
    rate = []
    if (req.body.ratings) {
      req.body.ratings.forEach((r) => {
        if (r.starttime != "-") {
          rate.push(r)
        }
      })
    }
    req.body.ratings = rate
  }
  // console.log("2", req.body.ratings)
  let data = await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, topic: req.body.topic, type: req.body.type }, req.body)
  res.send(data)
})

flushquizrating = (verifyToken, async (organisation_id, type, createdby, callback) => {
  (type == "codequiz") ? type = { $nin: [""] } : null;
  let compare = { organisation_id: organisation_id, type: type }
  if (createdby != undefined) {
    compare.createdby = createdby
  }
  // console.log(compare)
  doc = await manageData.getCodeQuiz("find", compare)
  std = await manageData.getStudentData('find', { organisation_id: organisation_id, dob: { $ne: "" } }, { _id: 0, mail: 1 })
  // console.log("stdmails", std)
  let change;
  doc.forEach(async (a, index) => {
    p = []
    // if (a.ratings && a.ratings.length != a.tempratings) {
    if (!a.ratings) { a.ratings = [] }
    if (a.ratings) {
      // console.log(a.ratings)
      a.ratings.forEach(b => {
        p.push(b.mail)
      });
      if (new Date(a.endson) <= new Date()) {
        stdmails = std.filter((obj) => !p.includes(obj.mail))
        tempmails = []
        a.tempratings.forEach(d => {
          tempmails.push(d.mail)
        });
        stdmails = stdmails.filter((obj) => !tempmails.includes(obj.mail))
        notattemptrating = 0
        stdmails.forEach(notattempt => {
          notattempt.timeremained = 0
          notattempt.timeconsumed = 0
          notattempt.marks = 0
          notattempt.main = 0
          notattempt.attemptedquiz = a.questions
          notattempt.starttime = "-"
          notattempt.endtime = "-"
          notattempt.tabcount = 0
          if (new Date(a.endson) <= new Date()) {
            a.ratings.push(notattempt)
            notattemptrating = 1
          }
        })
        if (notattemptrating == 1) {
          // console.log("welcome")
          await manageData.updateCodeQuiz("updateOne", { topic: a.topic, type: a.type }, { ratings: a.ratings })
        }
      }
      // console.log("stdmails",a.ratings);
      // if(new Date(a.endson) <= new Date()){
      //   a.ratings.concat(stdmails)
      // }
      // console.log("a.ratings",a.ratings)
      // console.log(stdmails)
      // z=a.tempratings.filter()
      x = a.tempratings.filter((c) => !p.includes(c.mail))
      change = 0
      x.forEach(y => {
        if ((Math.floor((new Date() - new Date(y.starttime)) / 60000) >= parseInt(a.totaltime)) || new Date(a.endson) <= new Date()) {
          a.ratings.push(y)
          p.push(y.mail)
          change = 1
          // stdmails=std.filter((obj)=>{!p.includes(obj.mail)})
          // console.log(stdmails)
        }
      });
      if (change == 1) {
        await manageData.updateCodeQuiz("updateOne", { topic: a.topic, type: a.type }, { ratings: a.ratings })
      }
      if (doc.length - 1 == index) { data = doc }
    }
  });
  data = doc
  return callback(data)
})

gettopics = (verifyToken, async (req, res) => {

  flushquizrating(req.body.organisation_id, req.body.type, req.body.createdby, (data) => {
    data.sort((a, b) => (a.startson > b.startson) ? 1 : ((b.startson > a.startson) ? -1 : 0))
    res.status(200).send({ data: data.reverse() })
  })
})

getquestions = (verifyToken, async (req, res) => {

  let data = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.organisation_id, topic: req.body.topic, type: req.body.type })
  if (data == null) { data = [] };

  res.send(data)
})

getquiztestquestions = (verifyToken, async (req, res) => {

  docs = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.organisation_id, topic: req.body.topic, type: req.body.type })
  !docs && res.send({ message: "error" })
  test = 0
  if (docs.ratings) {
    docs.ratings.forEach((x) => {
      if (x.mail == req.body.mail) {

        test = 1
      }
    });
  }
  if (test == 1) { res.send({ message: "TEST TIME OUT" }) }
  else {
    let a = docs.tempratings
    let c = 0;
    if (a) {
      a.forEach(async (e) => {
        if (e.mail == req.body.mail) {
          if (Math.floor((new Date() - new Date(e.starttime)) / 60000) >= parseInt(docs.totaltime) || e.swaps > 5) {
            c = 1
            docs.ratings.push(e)
            docss11 = await manageData.updateCodeQuiz("updateOne", { topic: req.body.topic, type: "quiz" }, { ratings: docs.ratings })
            docss11 && res.send({ message: "TEST TIME OUT" })
          }
          else {
            c = 1
            e.tabcount = e.tabcount + 1
            // console.log("e.tabcount", e.tabcount)
            res.send({ docs: docs, starttime: e.starttime, tabcount: e.tabcount, quesvisit: e.quesvisit })
          }
        }
      });
    }

    if (c != 1) {
      let mainrating = {
        mail: req.body.mail,
        starttime: new Date(),
        timeremained: 0,
        timeconsumed: 0,
        marks: 0,
        main: 0,
        attemptedquiz: docs.questions,
        tabcount: 1
      };
      (docs.tempratings) ? docs.tempratings.push(mainrating) : (docs.tempratings = [], docs.tempratings.push(mainrating));
      docss1 = await manageData.updateCodeQuiz("updateOne", { topic: req.body.topic, type: "quiz" }, { tempratings: docs.tempratings })
      docss1 && res.send({ docs: docs, starttime: mainrating.starttime, tabcount: mainrating.tabcount })
    }
  }
})



getcodetestquestions = (verifyToken, async (req, res) => {


  Practice.findOne(
    { organisation_id: req.body.organisation_id, topic: req.body.topic, type: req.body.type },
    function (err, docs) {
      if (err || docs == null) {
        res.send({ message: "error" })
      } else {
        test = 0
        docs.ratings.forEach((x) => {
          if (x.mail == req.body.mail) {
            test = 1
            res.send({ message: "TEST TIME OUT" })
          }
        });
        if (test == 0) {
          let a = docs.tempratings
          let c = 0;

          a.forEach(e => {
            if (e.mail == req.body.mail) {

              if (Math.floor((new Date() - new Date(e.starttime)) / 60000) >= parseInt(docs.totaltime) || e.swaps >= 5) {
                // console.log("e.swaps > 5")
                c = 1
                let mytestcases = 0, totaltestcases = 0
                docs.questions.forEach(e => {
                  let testcase = e[0].testcasesmarks.filter(e => e.mail == req.body.mail)
                  if (testcase.length > 0) {
                    mytestcases = mytestcases + testcase[0].marks
                  }
                  totaltestcases = e[0].testcases.length + totaltestcases
                })
                let rating = (mytestcases / (totaltestcases * 10)) * docs.totalmarks
                let coderating = (rating / docs.totalmarks) * 95
                !e.timeremained ? e.timeremained = 0 : null;
                // console.log("timerating = (e.timeremained / docs.totaltime)", e.timeremained, docs.totaltime)
                let timerating = (e.timeremained / docs.totaltime) * 5
                let totalrating = coderating + timerating
                // console.log(" totalrating = coderating + timerating", totalrating, coderating, timerating)
                if (coderating == 0) { totalrating = 0 }
                docs.ratings.push({ main: totalrating, ...e })
                Practice.updateOne({ organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { $set: { ratings: docs.ratings } }, (err, docs12) => {
                  if (!err) {
                    res.send({ message: "TEST TIME OUT" })
                  } else {
                    // console.log(
                    //   "error while retriving all records:",
                    //   JSON.stringify(err, undefined, 2)
                    // console.log("error")
                  }
                })
              }
              else {
                c = 1
                // console.log("e.starttime:", e.starttime)
                e.swaps = e.swaps + 1
                res.send({ docs: docs, starttime: e.starttime, swaps: e.swaps, initiate: "second", quesvisit: e.quesvisit })
              }
            }
          });

          if (c != 1) {
            let mainrating = {
              mail: req.body.mail,
              starttime: new Date(),
              swaps: 1
            }
            docs.tempratings.push(mainrating)
            Practice.updateOne(
              { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "code" },
              { $set: { tempratings: docs.tempratings } },
              function (errr, docss1) {
                if (!errr) {
                  res.send({ docs: docs, starttime: mainrating.starttime, swaps: mainrating.swaps, initiate: "first" })
                } else {
                  // console.log("error while retriving all records:", JSON.stringify(err, undefined, 2)
                  // )
                }
              }
            )

          }
        }
      }
    }
  )
})



testcodeapi = async (data) => {
  const supportedLanguages = ["java", "cpp", "py", "c"];
  const compilerVersions = ["11.0.15", "11.2.0", "3.7.7", "11.2.0"];
  let output = "";
  const { language = "", code, input = "" } = data;

  if (code === undefined) output = "No code specified to execute.";
  if (!supportedLanguages.includes(language))
    output = `Language ${language} is not supported. Please refer to docs to know the supported languages.`;

  if (code !== undefined && supportedLanguages.includes(language)) {
    const codeFile = createCodeFile(language, code);

    switch (language) {
      case "java":
        output = await executeJava(codeFile, input);
        break;
      case "py":
        output = await executePython(codeFile, input);
        break;
      case "cpp":
        output = await executeCorCPP(codeFile, input);
        break;
      case "c":
        output = await executeCorCPP(codeFile, input);
        break;
    }
  }

  return output;

}

deleteallfiles = () => {
  const fs = require('fs');
  const path = require('path');
  const directory = './controllers/codes';
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
}

testanswer = (verifyToken, async (req, res) => {

  // console.log(req.body)
  let testcaseresponse = [], success = 0
  req.body.paramvalues.forEach(async (e, index) => {
    let output = req.body.question.testcases[index].output
    let code = req.body.ans;
    let language = req.body.language;
    let input = e.join('\n')
    // console.log(req.body, "req.bodyyyyyyyyyyyyyyyyyyyyyyyyyy")
    let data = ({
      "code": code,
      "language": language,
      "input": input
    });

    let codeoutput = await testcodeapi(data)
    deleteallfiles();
    if (codeoutput.success) {
      codeoutput = codeoutput.output
      codeoutput = codeoutput.trim()
      codeoutput = codeoutput.split('\n')
      codeoutput.forEach((r, ir) => {
        codeoutput[ir] = codeoutput[ir].trim()
      })
      codeoutput = codeoutput.join('\n');
    }
    else {
      codeoutput = codeoutput.error
    }

    if (codeoutput == output) {
      testcaseresponse.push({ "input": req.body.paramvalues[index], "output": codeoutput, status: 'passed', testcasenumber: index + 1, "expected": output })
      success = success + 10
    }
    else {
      testcaseresponse.push({ "input": req.body.paramvalues[index], "output": codeoutput, status: 'failed', "expected": output, testcasenumber: index + 1 })
    }

    if (testcaseresponse.length == req.body.paramvalues.length) {

      ress = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic })

      ress.questions.forEach(e => {
        if (e[0].questionis == req.body.question.questionis) {
          if (e[0].attemptedmails.includes(req.body.mail)) {
            e[0].testcasesmarks.forEach((t, it) => {
              if (t.mail == req.body.mail && success > t.marks) {
                e[0].testcasesmarks[it].marks = success
              }
            })
          }
          else {
            e[0].attemptedmails.push(req.body.mail)
            e[0].testcasesmarks.push({ mail: req.body.mail, marks: success })
          }
        }
      })
      await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { questions: ress.questions })
      testcaseresponse.sort((a, b) => (a.testcasenumber > b.testcasenumber) ? 1 : ((b.testcasenumber > a.testcasenumber) ? -1 : 0))
      res.send({ data: testcaseresponse, count: success / 10 })

    }

    // console.log(data)
    // let config = {
    //   method: 'post',
    //   url: 'https://codexweb.netlify.app/.netlify/functions/enforceCode',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   data: data
    // };
    // console.log(config)
    // //calling the code compilation API
    // Axios(config)
    //   .then(async (response) => {
    //     response.data.output = response.data.output.trim()
    //     response.data.output = response.data.output.split('\n')
    //     response.data.output.forEach((r, ir) => {
    //       response.data.output[ir] = response.data.output[ir].trim()
    //     })
    //     response.data.output = response.data.output.join('\n');

    //     if (response.data.output == output) {
    //       testcaseresponse.push({ "input": req.body.paramvalues[index], "output": response.data.output, status: 'passed', testcasenumber: index + 1, "expected": output })
    //       success = success + 10
    //     }
    //     else {
    //       testcaseresponse.push({ "input": req.body.paramvalues[index], "output": response.data.output, status: 'failed', "expected": output, testcasenumber: index + 1 })
    //     }

    //     if (testcaseresponse.length == req.body.paramvalues.length) {
    //       ress = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic })
    //       ress.questions.forEach(e => {
    //         if (e[0].questionis == req.body.question.questionis) {
    //           if (e[0].attemptedmails.includes(req.body.mail)) {
    //             e[0].testcasesmarks.forEach((t, it) => {
    //               if (t.mail == req.body.mail && success > t.marks) {
    //                 e[0].testcasesmarks[it].marks = success
    //               }
    //             })
    //           }
    //           else {
    //             e[0].attemptedmails.push(req.body.mail)
    //             e[0].testcasesmarks.push({ mail: req.body.mail, marks: success })
    //           }
    //         }
    //       })
    //       await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { questions: ress.questions })
    //       testcaseresponse.sort((a, b) => (a.testcasenumber > b.testcasenumber) ? 1 : ((b.testcasenumber > a.testcasenumber) ? -1 : 0))
    //       res.send({ data: testcaseresponse, count: success / 10 })

    //     }
    //   }).catch((error) => {
    //     testcaseresponse.push("hell")
    //     if (testcaseresponse.length == req.body.paramvalues.length) {
    //       res.send({ data: [] })
    //     }
    //   });
  })
})

savecode = (verifyToken, async (req, res) => {


  ress = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.compare.organisation_id, type: 'code', topic: req.body.compare.topic })
  // console.log("ress", ress)
  ress.questions.forEach((e, i) => {
    let existcode;
    if (e[0].tempcode) {
      existcode = e[0].tempcode.filter(t => t.mail == req.body.mail)
    }
    if (existcode && existcode.length == 0) {
      e[0].tempcode.push({ mail: req.body.mail, [req.body.mail]: req.body.ans[i], ans: req.body.ans[i] })
    }
    else {
      let indexneed = e[0].tempcode.findIndex(p => { return p.mail == req.body.mail })
      ress.questions[i][0].tempcode[indexneed][req.body.mail] = req.body.ans[i];
    }
  })
  if (req.body.firstime == 'yes') {
    let temp = ress.tempratings.filter(e => e.mail == req.body.mail)
    if (temp.length == 0) { ress.tempratings.push({ mail: req.body.mail, starttime: req.body.date, swaps: 0, quesvisit: req.quesvisit }) }
  }
  else {
    ress.tempratings.forEach((a) => {
      if (a.mail == req.body.mail) {
        a.quesvisit = req.body.quesvisit
      }
    })
  }
  let endtime = ""
  if (ress.ratings) {
    ress.ratings.forEach((x, index) => {
      if (x.mail == req.body.mail) {
        endtime = ress.ratings[index].endtime
        res.send({ message: "success", endtime: endtime, endson: ress.endson })
      }
    });
  }
  if (endtime == "") {
    await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.compare.topic }, { questions: ress.questions, tempratings: ress.tempratings })
    codetempratings(req.body)
    res.send({ message: "success", endson: ress.endson })
  }
})

ratingstudent = (verifyToken, async (req, res) => {

  ress = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic })
  let mytestcases = 0, totaltestcases = 0
  ress.questions.forEach(e => {
    let testcase = e[0].testcasesmarks.filter(e => e.mail == req.body.mail)
    if (testcase.length > 0) {
      mytestcases = mytestcases + testcase[0].marks
    }
    totaltestcases = e[0].testcases.length + totaltestcases
  })
  let rating = (mytestcases / (totaltestcases * 10)) * ress.totalmarks
  let coderating = (rating / ress.totalmarks) * 95
  let timerating = (req.body.timeremained / ress.totaltime) * 5
  let totalrating = coderating + timerating
  if (coderating == 0) { totalrating = 0 }
  ratingobj = { mail: req.body.mail, main: totalrating, endtime: req.body.endtime, swaps: req.body.swaps, starttime: req.body.starttime, timeremained: req.body.timeremained, quesvisit: req.body.quesvisit };
  (ress.ratings) ? ress.ratings.push(ratingobj) : (ress.ratings = [], ress.ratings.push(ratingobj));
  await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { ratings: ress.ratings })
  res.send({ message: "success", rating: totalrating })
})

codetempratings = (verifyToken, async (req) => {
  // console.log("codetempratings", req)
  ress = await manageData.getCodeQuiz("findOne", { organisation_id: req.organisation_id, type: 'code', topic: req.topic })
  let mytestcases = 0, totaltestcases = 0
  ress.questions.forEach(e => {
    let testcase
    if (e[0].testcasesmarks > 0) {
      testcase = e[0].testcasesmarks.filter(e => e.mail == req.mail)
    }
    if (testcase && testcase.length > 0) {
      mytestcases = mytestcases + testcase[0].marks
    }
    totaltestcases = e[0].testcases.length + totaltestcases
  })
  let rating = (mytestcases / (totaltestcases * 10)) * ress.totalmarks
  let coderating = (rating / ress.totalmarks) * 95
  let timerating = (req.timeremained / ress.totaltime) * 5
  let totalrating = coderating + timerating
  if (coderating == 0) { totalrating = 0 }
  ress.tempratings.forEach((x, index) => {
    if (x.mail == req.mail) {
      ress.tempratings[index] = { mail: req.mail, main: totalrating, swaps: req.swaps, starttime: req.starttime, timeremained: req.timeremained, endtime: req.endtime }
    }
  });
  await manageData.getCodeQuiz("updateOne", { organisation_id: req.organisation_id, type: 'code', topic: req.topic }, { tempratings: ress.tempratings })
  return true
})

// quizratingstudent = (req, res) => {
//   // console.log("req.body",JSON.stringify(req.body))
//   Practice.findOne(
//     { topic: req.body.topic, type: "quiz" },
//     function (err, docs1) {
//       if (err || docs1 == null) {
//         // console.log("error")
//         res.send("error")
//       } else {
//         // if (docs1.ratings != null) {
//         let marks = req.body.marks
//         req.body.timeremained = parseFloat(req.body.timeremained)
//         docs1.totaltime = parseFloat(docs1.totaltime)
//         let mrpcal = (marks / docs1.totalmarks) * 95
//         let trpcal = (req.body.timeremained / docs1.totaltime) * 5
//         let mainrat = mrpcal + trpcal
//         if (marks == 0) {
//           mainrat = 0
//         }

//         let mainrating = {
//           mail: req.body.mail,
//           timeremained: req.body.timeremained,
//           timeconsumed: docs1.totaltime - req.body.timeremained,
//           marks: marks,
//           main: mainrat,
//           attemptedquiz: req.body.attemptedquiz,
//           starttime: req.body.starttime,
//           endtime: req.body.endtime,
//           tabcount: req.body.tabcount
//         }

//         // (docs1.ratings == null) ? docs1.ratings = [] : null;
//         docs1.ratings.push(mainrating)
//         // console.log("docs1.ratings", docs1.ratings)
//         // return res.send({ message: "success" })
//         Practice.updateOne(
//           { topic: req.body.topic, type: "quiz" },
//           { $set: { ratings: docs1.ratings } },
//           function (errr, docss1) {
//             if (!errr) {
//               return res.send({ message: "success" })
//             } else {
//               console.log(
//                 "error while retriving all records:",
//                 JSON.stringify(err, undefined, 2)
//               )
//             }
//           }
//         )
//       }
//     }
//   )
// }

quizratingstudent = (verifyToken, async (req, res) => {

  docs1 = await manageData.getCodeQuiz("findOne", { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "quiz" })
  !docs1 && res.send("error")
  let marks = req.body.marks
  req.body.timeremained = parseFloat(req.body.timeremained)
  docs1.totaltime = parseFloat(docs1.totaltime)
  let mrpcal = (marks / docs1.totalmarks) * 95
  let trpcal = (req.body.timeremained / docs1.totaltime) * 5
  let mainrat = mrpcal + trpcal
  if (marks == 0) {
    mainrat = 0
  }
  let mainrating = {
    mail: req.body.mail,
    timeremained: req.body.timeremained,
    timeconsumed: docs1.totaltime - req.body.timeremained,
    marks: marks,
    main: mainrat,
    attemptedquiz: req.body.attemptedquiz,
    starttime: req.body.starttime,
    endtime: req.body.endtime,
    tabcount: req.body.tabcount,
    quesvisit: req.body.quesvisit
  };

  // console.log("docs1.ratings", docs1.ratings);
  (docs1.ratings) ? docs1.ratings.push(mainrating) : (docs1.ratings = [], docs1.ratings.push(mainrating));
  // console.log("docs1.ratings", docs1.ratings)
  docss1 = await manageData.updateCodeQuiz("updateOne", { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "quiz" }, { ratings: docs1.ratings });
  // console.log(docss1);
  docss1 && res.send({ message: "success" })
})

quizratingstudentupdate = (verifyToken, async (req, res) => {

  // console.log("quizratingstudentupdate")
  docs1 = await manageData.getCodeQuiz("findOne", { organisation_id: req.body.organisation_id, topic: req.body.topic, type: "quiz" })
  !docs1 && res.send("error")
  let marks = req.body.marks
  req.body.timeremained = parseFloat(req.body.timeremained)
  docs1.totaltime = parseFloat(docs1.totaltime)
  let mrpcal = (marks / docs1.totalmarks) * 95
  let trpcal = (req.body.timeremained / docs1.totaltime) * 5
  let mainrat = mrpcal + trpcal
  if (marks == 0) {
    mainrat = 0
  }
  let mainrating = {
    mail: req.body.mail,
    timeremained: req.body.timeremained,
    timeconsumed: docs1.totaltime - req.body.timeremained,
    marks: marks,
    main: mainrat,
    attemptedquiz: req.body.attemptedquiz,
    starttime: req.body.starttime,
    tabcount: req.body.tabcount,
    quesvisit: req.body.quesvisit,
  }
  docs1.tempratings.forEach((x, index) => {
    if (x.mail == req.body.mail) {
      docs1.tempratings[index] = mainrating
    }
  });
  let endtime = "";

  if (docs1.ratings) {
    docs1.ratings.forEach((x, index) => {
      if (x.mail == req.body.mail) {
        endtime = docs1.ratings[index].endtime
        res.send({ message: "success", endtime: endtime, endson: docs1.endson })
      }
    });
  }

  // console.log("endtime", endtime)
  if (endtime == "") {
    update = await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, topic: req.body.topic, type: "quiz" }, { tempratings: docs1.tempratings });
    // console.log(update, "update", { message: "success", endtime: endtime, endson: docs1.endson });
    res.send({ message: "success", endtime: endtime, endson: docs1.endson })
    // if(update.message)res.send({ message: "success", endtime: endtime, endson: docs1.endson })
  }
})

updateswaps = (verifyToken, async (req, res) => {

  datas = await manageData.getCodeQuiz("findOne", { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "code" })
  datas.tempratings.forEach(async (e, i) => {
    if (e.mail == req.body.mail) {
      datas.tempratings[i].swaps = datas.tempratings[i].swaps + 1
      datas.tempratings[i].quesvisit = req.body.quesvisit
      let endtime = ""
      req.body.swaps = datas.tempratings[i].swaps
      codetempratings(req.body);
      datas.ratings && datas.ratings.forEach(async (x, index) => {
        if (x.mail == req.body.mail) {
          endtime = datas.ratings[index].endtime
          await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { tempratings: datas.tempratings })
          res.send({ swaps: datas.tempratings[i].swaps, message: "success", endtime: endtime })
        }
      });
      // await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { tempratings: datas.tempratings })
      (endtime == "") ?
        (await manageData.updateCodeQuiz("updateOne", { organisation_id: req.body.organisation_id, type: 'code', topic: req.body.topic }, { tempratings: datas.tempratings })
          , res.send({ swaps: datas.tempratings[i].swaps, message: "success", endtime: endtime })) : null;
    }
  })
})

viewattemptedquiz = (verifyToken, async (req, res) => {

  datas = await manageData.getCodeQuiz("findOne", { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "quiz" })
  datas.ratings.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
  data = datas.ratings.filter((e) => e.mail == req.body.mail)
  data[0].rank = datas.ratings.findIndex((a) => { return a.mail == req.body.mail }) + 1
  details = { topic: datas.topic, totaltime: datas.totaltime, totalmarks: datas.totalmarks, startson: datas.startson, endson: datas.endson }
  res.send({ data: data[0], details: details })
})

getime = (verifyToken, async (req, res) => {

  datas = await manageData.getCodeQuiz("findOne", { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "code" })
  data = datas.tempratings.filter((e) => e.mail == req.body.mail)
  if (data.length == 0) {
    res.send({ data: req.body.date })
  }
  else { res.send({ data: data[0].startime, swaps: data[0].swaps }) }
})

getswaps = (verifyToken, async (req, res) => {

  datas = await manageData.getCodeQuiz("findOne", { topic: req.body.topic, organisation_id: req.body.organisation_id, type: "code" })
  let temp = datas.tempratings.filter(e => e.mail == req.body.mail)
  if (temp.length > 0) {
    if (temp[0].swaps == 0) {
      res.send({ swaps: true, count: temp[0].swaps })
    }
    else {
      res.send({ swaps: true, count: temp[0].swaps })
    }
  }
  else {
    res.send({ swaps: false })
  }
})

testcompiler = (verifyToken, async (req, res) => {

  let code = "n=input();print(n);k=input();print(km)";
  let language = "python";
  let input = "hell hellooooo 30 \n i am amreeb";
  if (language === "python") {
    language = "py"
  }
  let data = ({
    "code": code,
    "language": language,
    "input": input
  });
  let config = {
    method: 'post',
    url: 'https://codexweb.netlify.app/.netlify/functions/enforceCode',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };
  Axios(config)
    .then((response) => {
      res.send(response.data)
      // console.log(response.data)
    }).catch((error) => {
      res.send(error)
      // console.log(error);
    });
})

dashboardswaps = (verifyToken, async (req, res) => {

  docs = await manageData.getCodeQuiz("find", {})
  if (docs.length == 0) {
    res.send({ message: "success" })
  }
  else {
    docs.forEach((h, i) => {
      r = 1
      if (h.tempratings.length > h.ratings.length) {
        let notadded = h.tempratings.filter(ad => h.ratings.every(fd => fd.mail !== ad.mail));
        notadded.forEach(async (k) => {
          ress = await manageData.getCodeQuiz("findOne", { organisation_id: h.organisation_id, type: 'code', topic: h.topic });
          let mytestcases = 0, totaltestcases = 0;
          if (ress) {
            ress.questions.forEach(e => {
              let testcase = e[0].testcasesmarks.filter(e => e.mail == k.mail);
              (testcase.length > 0) && (mytestcases = mytestcases + testcase[0].marks);
              totaltestcases = e[0].testcases.length + totaltestcases;
            })

            let rating = (mytestcases / (totaltestcases * 10)) * ress.totalmarks
            let coderating = (rating / ress.totalmarks) * 95
            let timerating = (0 / ress.totaltime) * 5
            let totalrating = coderating + timerating
            if (coderating == 0) { totalrating = 0 }
            ress.ratings.push({ mail: k.mail, main: totalrating, endtime: new Date() })
            await manageData.updateCodeQuiz("updateOne", { organisation_id: h.organisation_id, type: 'code', topic: h.topic }, { ratings: ress.ratings })
            if (i == docs.length - 1) {
              res.send({ message: "success" })
            }
          }
          else {

          }
        })
      }
      else {
        if (i == docs.length - 1) {
          res.send({ message: "success" })
        }
      }
    })
  }
})

module.exports = { uploadpractice, editpractice, gettopics, getquestions, getquiztestquestions, getcodetestquestions, testanswer, flushquizrating, uploadpractice, ratingstudent, savecode, quizratingstudent, dashboardswaps, quizratingstudentupdate, testcompiler, getswaps, getime, viewattemptedquiz, updateswaps }
