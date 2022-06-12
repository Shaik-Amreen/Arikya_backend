const jwt = require("jsonwebtoken")

exports.verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized request")
  }
  let token = Buffer.from(
    req.headers.authorization.split(" ")[1],
    "base64"
  ).toString()
  if (token == null) {
    return res.send({ status: "Unauthorized request" })
  } else {
    let payload = jwt.verify(token, "amreenkousar")
    if (!payload) {
      return res.send({ status: "Unauthorized request" })
    }
    else {
      res.json({ status: "success" })
      next()
    }
  }
}
