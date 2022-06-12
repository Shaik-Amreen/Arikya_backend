const express = require("express")
var router = express.Router()

const Practice = require("../controllers/codeQuiz")

router.post("/uploadpractice", Practice.uploadpractice)
router.post("/testcompiler", Practice.testcompiler)
router.post("/ratingstudent", Practice.ratingstudent)
router.post("/gettopics", Practice.gettopics)
router.post("/getquestions", Practice.getquestions)
router.post("/getquiztestquestions", Practice.getquiztestquestions)
router.post("/getcodetestquestions", Practice.getcodetestquestions)
// router.post("/checkanswer", Practice.checkanswer)
router.post("/testanswer", Practice.testanswer),
    router.post("/savecode", Practice.savecode),
    router.post("/getime", Practice.getime),
    router.post("/updateswaps", Practice.updateswaps),
    router.post("/getswaps", Practice.getswaps),
    router.post('/dashboardswaps', Practice.dashboardswaps)

router.post('/editcodequiz', Practice.editpractice)
router.post("/viewattemptedquiz", Practice.viewattemptedquiz)
router.post("/quizratingstudent", Practice.quizratingstudent)
router.post("/quizratingstudentupdate", Practice.quizratingstudentupdate)

module.exports = router
