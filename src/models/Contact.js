const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  ticketNumber: String, // Naya field add kiya
  name: String,
  email: String,
  phone: String,
  message: String
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);