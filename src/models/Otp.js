const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  name: String,

  email: String,

  mobile: String,

  password: String,

  otp: String,

  expiresAt: Date
},
{
  timestamps:true
});

module.exports = mongoose.model("Otp", otpSchema);