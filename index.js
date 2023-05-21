const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const SampleHostelUser = require("./Models/SampleHostelUser");

/////////////////////////////////////////////////////////////

// Middlewears
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://token-server.netlify.app"],
  })
);

/////////////////////////////////////////////////////////////

// BCRYPT

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });
};

const comparePassword = (password, haashed) => {
  return bcrypt.compare(password, haashed);
};

/////////////////////////////////////////////////////////////

// ROUTES

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  const { name, hallTicket, room, password } = req.body;
  try {
    const userExist = await SampleHostelUser.findOne({ hallTicket });
    if (userExist) {
      const passwordMatch = password === userExist.password;
      const NameMatch = name === userExist.name;
      const roomMatch = room === userExist.room;

      if (passwordMatch && roomMatch && NameMatch) {
        jwt.sign(
          {
            id: userExist._id,
            name: userExist.name,
            room: userExist.room,
            hallTicket: userExist.hallTicket,
            branch: userExist.branch,
            year: userExist.year,
            mobile: userExist.mobile,
            pic: userExist.pic,
          },
          process.env.JWT_SECRET,
          { expiresIn: "6h" },
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token).json(userExist);
          }
        );
      } else
        res.status(401).json({
          error: "not found",
        });

      // console.log(userExist)
      // console.log(passwordMatch)
    } else {
      res.status(401).json("User Not Found");
    }
  } catch (e) {
    res.json(e);
  }
});

// PROFILE ROUTE

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, data) => {
      if (err) throw err;
      const { _id, name, room, hallTicket, branch, year, mobile, pic } =
        await SampleHostelUser.findById(data.id);
      res.json({
        _id,
        name,
        room,
        hallTicket,
        branch,
        year,
        mobile,
        pic,
      });
    });
  }
});

// DASHBOARD ROUTE

app.get("/user/dashboard", async (req, res) => {
  try {
    const { name, _id, hallTicket } = req.body;

    const UserData = await SampleHostelUser.findOne(hallTicket);
    res.json(UserData);
  } catch (e) {
    console.log(e);
  }
});
/////////////////////////////////////////////////////////////

// PORT AND DATABASE CONNECTION
const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(port);
  console.log(
    `A site is running on the port ${port} wihh a succesful database connection`
  );
});

/////////////////////////////////////////////////////////////
