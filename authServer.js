if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const fs = require("fs");
const http = require("http");
const https = require("https");

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/litwick/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/litwick.be/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/litwick.be/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const app = express();
const port = process.env.PORT || 4000;

const indexRouter = require("./routes/index");
const authenticationRouter = require("./routes/authentication");

app.use(cors());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.json());

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

mongoose.connect(process.env.DATABASE_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use("/", indexRouter);
app.use("/auth", authenticationRouter);

app.listen(port, () => {
  console.log("NodeJs app listening at port " + port);
});
