const express = require("express");
const router = express.Router();

const { register, verifyOTP, login } = require("../controllers/authController");
const { auth } = require("../middleware/auth"); // Tera auth middleware yahan import kiya
const { getUserProfile, addAddress, deleteAddress } = require("../controllers/userController");

// Authentication Routes
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

// Naye User Profile & Multiple Address Routes
router.get("/profile", auth, getUserProfile); 
router.post("/address", auth, addAddress); 
router.delete("/address/:addressId", auth, deleteAddress); 

module.exports = router;