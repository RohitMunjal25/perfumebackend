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
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 8,
      select: false
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
    addresses: [addressSchema],
    lastLogoutAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
