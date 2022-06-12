const manageData = require('./manageData')
var randomstring = require("randomstring")
const verifyToken = require("./verifyToken")

exports.createPlacement = (verifyToken, async (req, res, next) => {

  async function sampost() {
    const ran = () => {
      return randomstring.generate(req.body.placementcyclename.length)
    }
    let sran = ran()
    let passcodes = await manageData.getPlacementDetails('findOne', { code: sran }, { _id: 0, code: 1 })
    if (passcodes == null) {
      req.body.code = sran;
      let postpasscode = await manageData.postPlacementDetails('create', req.body);
      (postpasscode && postpasscode.message == 'error') ? res.send({ message: 'already exists' }) : res.send({ message: "success" });
    }
    else if (err2 == null && docs2 != null) {
      sampost()
    }
  }
  sampost()
})

exports.findonePlacement = (verifyToken, async (req, res, next) => {

  let docs = await manageData.getPlacementDetails('findOne', { placementcyclename: req.body.placementcyclename, organisation_id: req.body.organisation_id }, { _id: 0 });
  if (!docs) {
    res.send({ message: "placement doesn't exists" })
  }
  else { res.send({ message: "success", docs: docs }) }
}
)

exports.findPlacement = (verifyToken, async (req, res) => {

  let docs = await manageData.getPlacementDetails('find', { organisation_id: req.body.organisation_id }, { _id: 0 })
  res.send(docs)
})



exports.updatePlacement = (verifyToken, async (req, res) => {

  let updateplacement = await manageData.updatePlacementDetails('updateMany', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, }, req.body)
  res.send(updateplacement)
})



