const express = require("express")
var router = express.Router()

const Placement = require("../controllers/placementDetails")

router.post("/findPlacement", Placement.findPlacement)
router.post("/createPlacement", Placement.createPlacement)
router.post("/updatePlacement", Placement.updatePlacement)
router.post("/findonePlacement", Placement.findonePlacement),
  (module.exports = router)
