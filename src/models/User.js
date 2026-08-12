const mongoose = require("mongoose");

// Address ka schema alag se define karke array me dalenge
const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    mobile: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    // Naya feature: Multiple addresses save karne ke liye array
    addresses: [addressSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);