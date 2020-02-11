const  CONFIG = require('./config/index');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use("/", express.static("public"));

const userRoute = require("./Routes/User");
const tripRoute = require("./Routes/Trip");

//call body parser
//Chỗ này có thể dùng cả 2 , để parse jon hoặc x-www-form-urlencoded nhé
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
//middleware static
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/docs", express.static(path.join(__dirname, "docs")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/users", userRoute);
app.use("/trips", tripRoute);

mongoose
  .connect(
    CONFIG.mongo_uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("connected!");
    app.listen(CONFIG.port);
  });
