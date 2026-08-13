const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  name: String,

  email: String,

  mobile: String,

  password: String,

  purpose: { type: String, enum: ["auth", "change_email", "password_reset"], default: "auth" },
  target: { type: String, required: true },

  otp: String,

  expiresAt: { type: Date, required: true }
},
{
  timestamps:true
});

module.exports = mongoose.model("Otp", otpSchema);
