require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

const posts = [
  {
    email: "Kyle@gmail.com",
    title: "Post 1",
  },
  {
    email: "Jim@gmail.com",
    title: "Post 2",
  },
];

app.use(express.json());

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.email === req.user.email));
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

app.listen(port, () => {
  console.log("NodeJs app listening at port " + port);
});
