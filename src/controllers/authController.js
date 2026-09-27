const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const TokenBlacklist = require("../models/TokenBlacklist");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../services/emailService");

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL = "10m";

const emailOf = (value) => String(value || "").trim().toLowerCase();
const mobileOf = (value) => String(value || "").trim();
const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role
});

const cooldownPayload = (otpDoc) => {
  const resendAvailableAt = new Date(otpDoc.createdAt.getTime() + OTP_RESEND_COOLDOWN_MS);
  const cooldownSeconds = Math.max(0, Math.ceil((resendAvailableAt.getTime() - Date.now()) / 1000));
  return {
    canResend: cooldownSeconds === 0,
    cooldownSeconds,
    resendAvailableAt
  };
};

const createOtp = async ({ email, purpose, name, mobile, password }) => {
  await Otp.deleteMany({ target: email, purpose });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpDoc = await Otp.create({
    name,
    email,
    mobile,
    password,
    target: email,
    purpose,
    otp,
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });

  await sendOTPEmail(email, otp);
  return otpDoc;
};

const ensureCooldownPassed = (otpDoc, res) => {
  if (!otpDoc) return false;

  const cooldown = cooldownPayload(otpDoc);
  if (!cooldown.canResend) {
    res.status(429).json({
      success: false,
      message: "Please wait before resending OTP",
      ...cooldown
    });
    return true;
  }

  return false;
};

const requestOtp = async (req, res) => {
  try {
    const email = emailOf(req.body.email);

    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found. Please register first." });
    }

    const existingOtp = await Otp.findOne({ target: email, purpose: "auth" }).sort({ createdAt: -1 });
    if (ensureCooldownPassed(existingOtp, res)) return;

    const otpDoc = await createOtp({
      email,
      purpose: "auth",
      name: user.name,
      mobile: user.mobile
    });

    res.json({
      success: true,
      message: "OTP sent to your email",
      ...cooldownPayload(otpDoc)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const purpose = req.body.purpose || "auth";

    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    if (!["auth", "change_email", "password_reset"].includes(purpose)) {
      return res.status(400).json({ success: false, message: "Invalid OTP purpose" });
    }

    const existingOtp = await Otp.findOne({
      target: email,
      purpose,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!existingOtp) {
      return res.status(404).json({
        success: false,
        message: "OTP expired. Please request a fresh OTP."
      });
    }

    if (ensureCooldownPassed(existingOtp, res)) return;

    const otpDoc = await createOtp({
      email,
      purpose,
      name: existingOtp.name,
      mobile: existingOtp.mobile,
      password: existingOtp.password
    });

    res.json({
      success: true,
      message: "OTP resent to your email",
      ...cooldownPayload(otpDoc)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const { otp } = req.body;

    if (!isEmail(email) || !otp) {
      return res.status(400).json({ success: false, message: "email and otp are required" });
    }

    const otpDoc = await Otp.findOne({
      target: email,
      purpose: "auth",
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: otpDoc.name,
        email,
        mobile: otpDoc.mobile,
        password: otpDoc.password,
        isVerified: true
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      if (otpDoc.mobile && !user.mobile) user.mobile = otpDoc.mobile;
      if (otpDoc.password && !user.password) user.password = otpDoc.password;
      await user.save();
    }

    await Otp.deleteMany({ target: email, purpose: "auth" });

    res.json({
      success: true,
      message: "Authentication successful",
      token: generateToken(user._id),
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerWithPassword = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const name = String(req.body.name || "").trim();
    const mobile = mobileOf(req.body.mobile || req.body.number || req.body.phone);
    const { password } = req.body;

    if (!name || !isEmail(email) || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, mobile and password are required"
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    if (await User.exists({ $or: [{ email }, { mobile }] })) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile already registered. Please login."
      });
    }

    const existingOtp = await Otp.findOne({ target: email, purpose: "auth" }).sort({ createdAt: -1 });
    if (ensureCooldownPassed(existingOtp, res)) return;

    const otpDoc = await createOtp({
      email,
      purpose: "auth",
      name,
      mobile,
      password: await bcrypt.hash(password, 12)
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Verify it to complete registration.",
      ...cooldownPayload(otpDoc)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginWithPassword = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const { password } = req.body;

    if (!isEmail(email) || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    await User.findByIdAndUpdate(
      req.user.id,
      { password: await bcrypt.hash(password, 12) },
      { runValidators: true }
    );

    res.json({ success: true, message: "Password saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const email = emailOf(req.body.email);

    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    const existingOtp = await Otp.findOne({ target: email, purpose: "password_reset" }).sort({ createdAt: -1 });
    if (ensureCooldownPassed(existingOtp, res)) return;

    const otpDoc = await createOtp({
      email,
      purpose: "password_reset",
      name: user.name,
      mobile: user.mobile
    });

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
      ...cooldownPayload(otpDoc)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPasswordReset = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const { otp, password } = req.body;

    if (!isEmail(email) || !otp || !password) {
      return res.status(400).json({ success: false, message: "email, otp and new password are required" });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const otpDoc = await Otp.findOne({
      target: email,
      purpose: "password_reset",
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { password: await bcrypt.hash(password, 12), isVerified: true },
      { new: true, runValidators: true }
    );

    await Otp.deleteMany({ target: email, purpose: "password_reset" });

    res.json({
      success: true,
      message: "Password reset successful",
      token: generateToken(user._id),
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const { otp } = req.body;
    if (!isEmail(email) || !otp) return res.status(400).json({ success:false, message:"email and OTP are required" });

    const otpDoc = await Otp.findOne({ target:email, purpose:"password_reset", otp, expiresAt:{ $gt:new Date() } });
    if (!otpDoc) return res.status(400).json({ success:false, message:"Invalid or expired OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success:false, message:"Account not found" });
    await Otp.deleteMany({ target:email, purpose:"password_reset" });

    const resetToken = jwt.sign({ id:user._id, purpose:"password_reset" }, process.env.JWT_SECRET, { expiresIn:PASSWORD_RESET_TOKEN_TTL });
    res.json({ success:true, message:"OTP verified. You can now set a new password.", resetToken });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

const completePasswordReset = async (req, res) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;
    if (!resetToken || !password || !confirmPassword) return res.status(400).json({ success:false, message:"New password and confirmation are required" });
    if (String(password).length < 8) return res.status(400).json({ success:false, message:"Password must be at least 8 characters" });
    if (password !== confirmPassword) return res.status(400).json({ success:false, message:"Passwords do not match" });

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== "password_reset") return res.status(401).json({ success:false, message:"Invalid password reset session" });
    const user = await User.findByIdAndUpdate(decoded.id, { password:await bcrypt.hash(password, 12), isVerified:true }, { new:true, runValidators:true });
    if (!user) return res.status(404).json({ success:false, message:"Account not found" });
    res.json({ success:true, message:"Password reset successful", token:generateToken(user._id), user:publicUser(user) });
  } catch (error) {
    const message = error.name === "TokenExpiredError" ? "Password reset session expired. Please request a new OTP." : error.message;
    res.status(401).json({ success:false, message });
  }
};

const requestEmailChange = async (req, res) => {
  try {
    const email = emailOf(req.body.email);

    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    if (await User.exists({ email, _id: { $ne: req.user.id } })) {
      return res.status(409).json({ success: false, message: "Email is already in use" });
    }

    const existingOtp = await Otp.findOne({ target: email, purpose: "change_email" }).sort({ createdAt: -1 });
    if (ensureCooldownPassed(existingOtp, res)) return;

    const otpDoc = await createOtp({
      email,
      purpose: "change_email"
    });

    res.json({
      success: true,
      message: "OTP sent to your new email",
      ...cooldownPayload(otpDoc)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const { otp } = req.body;

    const otpDoc = await Otp.findOne({
      target: email,
      purpose: "change_email",
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true, runValidators: true }
    ).select("-password");

    await Otp.deleteMany({ target: email, purpose: "change_email" });

    res.json({ success: true, message: "Email updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    await TokenBlacklist.create({
      token: req.token,
      expiresAt: new Date(req.user.exp * 1000)
    });
    await User.findByIdAndUpdate(req.user.id, { lastLogoutAt: new Date() });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestOtp,
  resendOtp,
  verifyOtp,
  registerWithPassword,
  loginWithPassword,
  setPassword,
  requestPasswordReset,
  verifyPasswordResetOtp,
  completePasswordReset,
  requestEmailChange,
  verifyEmailChange,
  logout
};
