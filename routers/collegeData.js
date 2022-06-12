const express = require("express")
var router = express.Router()
const data = require("../controllers/collegeData")

router.post("/findcollegeaccess", data.findata)
router.post("/postcollegeaccess", data.postdata)
router.post("/deletecollegeaccess", data.deletedata)
router.post("/findcollegename", data.findCollegeName)

module.exports = router
