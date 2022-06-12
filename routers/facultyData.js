const express = require("express")
var router = express.Router()

const Admin = require("../controllers/facultyData")
router.post("/deleteAdmin", Admin.deleteoneAdmin)
router.post("/updateAdmin", Admin.updateAdmin)
router.post("/findoneAdmin", Admin.findoneAdmin)
router.post("/finddata", Admin.findfacdata)

module.exports = router
