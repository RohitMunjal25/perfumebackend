const express = require("express");
const router = express.Router();

const { auth, admin } = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/adminController");

router.get("/dashboard", auth, admin, getDashboardStats);

module.exports = router;