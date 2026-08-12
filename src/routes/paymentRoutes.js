// paymentRoutes.js
const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/paymentController");
const { auth } = require("../middleware/auth"); // Auth middleware import kiya

// Ab sirf logged-in user hi payment initiate kar payega
router.post("/create-order", auth, createOrder); 

module.exports = router;