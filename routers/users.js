const express = require("express")
var router = express.Router()
const users = require("../controllers/users")
const verifyToken = require("../controllers/verifyToken")

router.post("/users", users.findUsers)
router.post("/createusers", users.createPassword)
router.post("/updateuser", users.updateoneUsers)
router.post("/findoneusers", users.findoneUsers)
router.post("/forgotpassword", users.forgotpassword)
router.post("/verify", verifyToken.verifyToken)
router.post("/changepassword", users.changepassword)
router.post("/findValidMail", users.findValidMail)
router.post("/feedback", users.feedmail)

module.exports = router
