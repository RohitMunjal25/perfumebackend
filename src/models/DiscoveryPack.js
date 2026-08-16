const mongoose = require("mongoose");

const discoveryPackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  bottleCount: { type: Number, required: true, min: 1 },
  // ---> YAHAN YE NAYA FIELD ADD KRNA HAI <---
  bottleSizeMl: { type: Number, default: 18 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("DiscoveryPack", discoveryPackSchema);