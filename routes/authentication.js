require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

//TODO IN DATABASE
let users = [];
let refreshTokens = [];

router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  users.push({ email: email, password: password });

  user = { email: email };

  const accestToken = generateAccesToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);

  res.json({ accessToken: accestToken, refreshToken: refreshToken });
});

router.post("/login", (req, res) => {
  //Authenticate User

  const email = req.body.email;
  const password = req.body.password;

  const user = users.find((u) => u.email == email);

  if (typeof user == "undefined") return res.sendStatus(401);
  if (user.password !== password) return res.sendStatus(401);

  const accestToken = generateAccesToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);

  res.json({ accessToken: accestToken, refreshToken: refreshToken });
});

router.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccesToken({ email: user.email });
    res.json({ accessToken: accessToken });
  });
});

router.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  console.log(refreshTokens);
  res.sendStatus(204);
});

function generateAccesToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
}

module.exports = router;
