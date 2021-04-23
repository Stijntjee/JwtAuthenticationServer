const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send({ users: users });
  } catch {}
});

module.exports = router;
