const express = require("express")
var router = express.Router()

const Company = require("../controllers/companyHirings")

router.post("/posthiringstudent", Company.createhirings)
router.post("/findcompanywise", Company.findcompanywise)
router.post("/findplacementwise", Company.findplacementwise)
router.post("/findstudentwise", Company.findstudentwise)
router.post("/hiringupdate", Company.updatehirings)
module.exports = router
