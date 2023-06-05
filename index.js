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
    origin: [
      "http://localhost:5173",
      "https://token-server.netlify.app",
      // "https://token-client.vercel.app",
    ],
  })
);

// CONTSANTS

const client = require("twilio")(process.env.SID, process.env.AUTHKEY);

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

// REGISTER ROUTE

app.post("/register", async (req, res) => {
  const { name, hallTicket, room, password, year, batch, branch } = req.body;

  try {
    const createUser = await SampleHostelUser.create({
      name: name,
      hallTicket: hallTicket,
      room: room,
      password: password,
      year: year,
      batch: batch,
      branch: branch,
    });

    res.json(createUser);
  } catch (e) {
    console.log(e);
  }
});

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
            batch: userExist.batch,
            motherName: userExist.motherName,
            motherMobile: userExist.motherMobile,
            fatherName: userExist.fatherName,
            fatherMobile: userExist.fatherMobile,
            address: userExist.address,
            complaints: userExist.complaints,
            roomPic: userExist.roomPic,
            profile: userExist.profile,
          },
          process.env.JWT_SECRET,
          { expiresIn: "6h" },
          (err, token) => {
            if (err) throw err;
            res
              .cookie("token", token, {
                secure: true,
                sameSite: "none",
              })
              .json(userExist);
          }
        );
      }
      // } else
      //   res.status(401).json({
      //     error: "not found",
      //   });

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
      SampleHostelUser.findById(data.id).then(
        ({
          _id,
          name,
          room,
          hallTicket,
          branch,
          year,
          mobile,
          pic,
          batch,
          motherName,
          motherMobile,
          fatherName,
          fatherMobile,
          address,
          complaints,
          roomPic,
          profile,
        }) => {
          SampleHostelUser.find().then((studentsList) => {
            SampleHostelUser.find({ room: room }).then((roomMates) => {
              res.json({
                _id,
                name,
                room,
                hallTicket,
                branch,
                year,
                mobile,
                pic,
                batch,
                motherName,
                motherMobile,
                fatherName,
                fatherMobile,
                address,
                complaints,
                roomPic,
                profile,
                roomMates: roomMates,
                studentsList: studentsList,
              });
            });
          });
        }
      );
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

// COMPLAINTS POST ROUTE

app.post("/user/complaints/sendComplaint", async (req, res) => {
  const {
    userName,
    userHallTicket,
    userBranch,
    userYear,
    userMobile,
    complaint,
  } = req.body;
  client.messages.create({
    body: `Sub: Complaint
    
            From: ${userName}, 
                  ${userHallTicket},
                  ${userMobile},
                  ${userYear} (${userBranch}) 

            Message:
            ${complaint}
            `,
    from: "whatsapp:+14155238886",
    to: "whatsapp:+918333020599",
  });
  const updateComplaints = await SampleHostelUser.updateOne(
    { hallTicket: userHallTicket },
    { $push: { complaints: complaint } }
  );
  res.json("DONE");
});

// CHANGE PASSWORD

app.post("/user/profile/changePassword", async (req, res) => {
  const { hallTicket, currentPassword, newPassword, confirmNewPassword } =
    req.body;

  try {
    const user = await SampleHostelUser.findOne({ hallTicket });

    if (user.password === currentPassword) {
      const userUpdate = await SampleHostelUser.findOneAndUpdate(
        { hallTicket },
        { password: confirmNewPassword }
      );
      console.log("Done");
      res.json({
        message: "Password Changed",
      });
    } else console.log("nooo");
  } catch (e) {
    res.json(e);
  }
});

// ROOM COMPLAINTS POST ROUTE

app.post("/user/room/sendComplaint", async (req, res) => {
  const {
    userName,
    userHallTicket,
    userBranch,
    userYear,
    userMobile,
    userRoom,
    complaint,
  } = req.body;
  client.messages.create({
    body: `Sub: Complaint regarding ${userRoom}

            From: ${userName}, 
                  ${userHallTicket},
                  ${userMobile},
                  ${userYear} (${userBranch}),
                  ${userRoom}

            Message:
            ${complaint}
            `,
    from: "whatsapp:+14155238886",
    to: "whatsapp:+918333020599",
  });
  const updateComplaints = await SampleHostelUser.updateOne(
    { hallTicket: userHallTicket },
    { $push: { complaints: complaint } }
  );
  res.json("DONE");
});

/////////////////////////////////////////////////////////////

// ADMIN ROUTES

app.post("/admin/students/createStudent", async (req, res) => {
  const {
    name,
    hallTicket,
    room,
    year,
    batch,
    branch,
    mobile,
    motherName,
    motherMobile,
    fatherName,
    fatherMobile,
    address,
    attendance,
    outings,
    complaints,
    messCharges,
  } = req.body;

  await SampleHostelUser.create({
    name,
    hallTicket,
    room,
    year,
    batch,
    branch,
    mobile,
    motherName,
    motherMobile,
    fatherName,
    fatherMobile,
    address,
    attendance,
    outings,
    complaints,
    messCharges,
  }).then(() => {
    res.json({
      message: "User created",
    });
  });
});

/////////////////////////////////////////////////////////////

// PORT AND DATABASE CONNECTION
const port = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(port);
  console.log(
    `A site is running on the port ${port} wihh a succesful database connection`
  );
});

/////////////////////////////////////////////////////////////
