const mongoose = require("mongoose");

const instagramFeedSchema = new mongoose.Schema({
  coverImageUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  instaLink: { type: String, required: true }, // Link to actual Instagram post/reel
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("InstagramFeed", instagramFeedSchema);