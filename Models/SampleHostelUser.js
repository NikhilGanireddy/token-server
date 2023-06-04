const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  hallTicket: {
    type: String,
    unique: true,
  },
  room: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  motherName: {
    type: String,
    default: "Mother Name",
  },
  motherMobile: {
    type: Number,
    default: 123456789,
  },
  fatherName: {
    type: String,
    default: "Father Name",
  },
  fatherMobile: {
    type: Number,
    default: 123456789,
  },
  address: {
    type: String,
    default: 99,
  },
  pic: {
    type: String,
    default:
      "https://e1.pxfuel.com/desktop-wallpaper/45/590/desktop-wallpaper-one-piece-luffy-computer.jpg",
  },
  password: {
    type: String,
    default: "password123",
  },
  complaints: {
    type: Array,
  },
  roomPic: {
    type: String,
    default:
      "https://images.pexels.com/photos/1853951/pexels-photo-1853951.jpeg",
  },
  messCharges: {
    type: Number,
    default: 5000,
  },
  outings: {
    type: Number,
    default: 24,
  },
  profile: {
    type: String,
    default: "user",
  },
});

const SampleHostelUserModel = mongoose.model("SampleHostelUsers", UserSchema);

module.exports = SampleHostelUserModel;
