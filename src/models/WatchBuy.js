const mongoose = require("mongoose");

const watchBuySchema = new mongoose.Schema({
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  coverImageUrl: { type: String, required: true },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product",
    required: true 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("WatchBuy", watchBuySchema);