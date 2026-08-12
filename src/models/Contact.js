const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  issue: { type: String, required: true },
  description: { type: String, required: true },
  attachmentUrl: String,
  status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
  resolutionNote: String
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
