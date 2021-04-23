require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.post("/register", async (req, res) => {
  let user;
  let hashedPassword;

  try {
    user = await User.findOne({ email: req.body.email });
  } catch {}

  if (user != null) return res.sendStatus(400);

  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log("4" + hashedPassword);
  } catch {}

  user = new User({
    email: req.body.email,
    password: hashedPassword,
    refreshToken: null,
    creationDate: Date.now(),
  });

  JwtUserData = { email: user.email };

  const accestToken = generateAccesToken(JwtUserData);
  const refreshToken = jwt.sign(JwtUserData, process.env.REFRESH_TOKEN_SECRET);

  user.refreshToken = refreshToken;

  await user.save((err) => {
    if (err) {
      return res.sendStatus(400);
    } else {
      res.json({ accessToken: accestToken, refreshToken: refreshToken });
    }
  });
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  let user;

  user = await User.findOne({ email: email });

  if (user == null) return res.sendStatus(401);

  const passwordIsValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!passwordIsValid) return res.sendStatus(401);

  JwtUserData = { email: email };

  const accestToken = generateAccesToken(JwtUserData);
  const refreshToken = jwt.sign(JwtUserData, process.env.REFRESH_TOKEN_SECRET);

  res.json({ accessToken: accestToken, refreshToken: refreshToken });
});

router.post("/token", async (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);

  try {
    user = await User.findOne({ refreshToken: req.body.token });
  } catch {}

  if (user == null) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccesToken({ email: user.email });
    res.json({ accessToken: accessToken });
  });
});

router.delete("/logout", async (req, res) => {
  try {
    user = await User.findOneAndUpdate(
      { refreshToken: req.body.token },
      { refreshToken: null }
    );
  } catch {}

  if (user != null) return res.sendStatus(400);
  res.sendStatus(204);
});

function generateAccesToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
}

module.exports = router;
