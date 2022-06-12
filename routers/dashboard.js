const express = require("express")
var router = express.Router()
const dashboard = require("../controllers/dashboard")

router.post("/dashboardcodedata", dashboard.dashboarcodedata)
router.post("/dashboardquizdata", dashboard.dashboarquizdata)
router.post("/totaldata", dashboard.totaldata)
router.post("/eachtestratings", dashboard.eachtestratings)
router.post("/alltestratings", dashboard.alltestratings)
router.post("/allcodequiztestratings", dashboard.allcodequiztestratings)
router.post("/stdprofilerating", dashboard.stdprofilerating)

module.exports = router
