const router = require("express").Router();
const { auth } = require("../middleware/auth");
const {
  requestOtp,
  resendOtp,
  verifyOtp,
  registerWithPassword,
  loginWithPassword,
  setPassword,
  requestPasswordReset,
  verifyPasswordReset,
  requestEmailChange,
  verifyEmailChange,
  logout
} = require("../controllers/authController");
const { getUserProfile, updateName, addAddress, updateAddress, deleteAddress } = require("../controllers/userController");

router.post("/register/request", registerWithPassword);
router.post("/login/otp/request", requestOtp);
router.post("/otp/request", requestOtp);
router.post("/otp/resend", resendOtp);
router.post("/otp/verify", verifyOtp);
router.post("/password/register", registerWithPassword);
router.post("/password/login", loginWithPassword);
router.post("/forgot/request", requestPasswordReset);
router.post("/forgot/verify", verifyPasswordReset);
router.patch("/password", auth, setPassword);
router.post("/email-change/request", auth, requestEmailChange);
router.post("/email-change/verify", auth, verifyEmailChange);
router.post("/logout", auth, logout);
router.get("/profile", auth, getUserProfile);
router.patch("/profile/name", auth, updateName);
router.post("/addresses", auth, addAddress);
router.patch("/addresses/:addressId", auth, updateAddress);
router.delete("/addresses/:addressId", auth, deleteAddress);
module.exports = router;
