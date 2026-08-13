const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: String,
  description: String,
  category: String,

  // Duplicates hata diye hain, ab ye sirf ek baar define hain
  coverImage: { type: String, default: "" },
  forHim: { type: Boolean, default: false },
  forHer: { type: Boolean, default: false },
  unisex: { type: Boolean, default: true },

  targetPages: [
    {
      type: String,
      enum: [
        "home",
        "categories",
        "collections"
      ]
    }
  ],

  homepageSections: [
    {
      type: String,
      trim: true
    }
  ],

  productImages: [
    {
      url: {
        type: String,
        required: true
      },
      angle: {
        type: String,
        default: ""
      },
      alt: {
        type: String,
        default: ""
      }
    }
  ],

  price: {
    type: Number,
    required: true
  },

  // Ye raha tera size wala logic (pehle se tha, ekdum sahi hai)
  bottleSizeMl: {
    type: Number,
    min: 1,
    default: null
  },

  stock: {
    type: Number,
    default: 0
  },

  images: [
    {
      type: String
    }
  ],

  featured: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);