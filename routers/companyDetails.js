const express = require("express")
var router = express.Router()

const company = require("../controllers/companyDetails")

router.post("/findcompanytoregister", company.findcompanytoregister)
router.post("/findcalcompany", company.findcalcompany)
router.post("/findacompany", company.findacompany)
router.post("/findcompany", company.findcompany)
router.post("/createcompany", company.createcompanydetails)
router.post("/updatecompany", company.updatecompanydetails)
router.post("/findallcompany", company.findallcompanies)
router.post("/updatestatus", company.updatestatus)

module.exports = router
