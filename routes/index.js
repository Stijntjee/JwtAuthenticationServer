const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({});
    res.send({ users: users });
  } catch {}
});

function authenticateToken(req, res, nex) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    nex();
  });
}

module.exports = router;
