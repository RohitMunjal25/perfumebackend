const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const TokenBlacklist = require("../models/TokenBlacklist");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../services/emailService");

const emailOf = (value) => String(value || "").trim().toLowerCase();
const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

// Email OTP works for both a new registration and an existing user login.
const requestOtp = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    const name = String(req.body.name || "").trim();
    if (!isEmail(email)) return res.status(400).json({ success: false, message: "A valid email is required" });
    const user = await User.findOne({ email });
    if (!user && !name) return res.status(400).json({ success: false, message: "Name is required for a new account" });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await Otp.deleteMany({ target: email, purpose: "auth" });
    await Otp.create({ name: user?.name || name, email, target: email, purpose: "auth", otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const verifyOtp = async (req, res) => {
  try {
    const email = emailOf(req.body.email), { otp } = req.body;
    if (!isEmail(email) || !otp) return res.status(400).json({ success: false, message: "email and otp are required" });
    const otpDoc = await Otp.findOne({ target: email, purpose: "auth", otp, expiresAt: { $gt: new Date() } });
    if (!otpDoc) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name: otpDoc.name, email, isVerified: true });
    else if (!user.isVerified) { user.isVerified = true; await user.save(); }
    await Otp.deleteMany({ target: email, purpose: "auth" });
    res.json({ success: true, message: "Authentication successful", token: generateToken(user._id), user: publicUser(user) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const registerWithPassword = async (req, res) => {
  try {
    const email = emailOf(req.body.email), name = String(req.body.name || "").trim(), { password } = req.body;
    if (!name || !isEmail(email) || !password) return res.status(400).json({ success: false, message: "name, email and password are required" });
    if (String(password).length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    if (await User.exists({ email })) return res.status(409).json({ success: false, message: "Email already registered. Use email OTP or password login." });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), isVerified: true });
    res.status(201).json({ success: true, message: "Registration successful", token: generateToken(user._id), user: publicUser(user) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const loginWithPassword = async (req, res) => {
  try {
    const email = emailOf(req.body.email), { password } = req.body;
    if (!isEmail(email) || !password) return res.status(400).json({ success: false, message: "email and password are required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    res.json({ success: true, token: generateToken(user._id), user: publicUser(user) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || String(password).length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    await User.findByIdAndUpdate(req.user.id, { password: await bcrypt.hash(password, 12) }, { runValidators: true });
    res.json({ success: true, message: "Password saved" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const requestEmailChange = async (req, res) => {
  try {
    const email = emailOf(req.body.email);
    if (!isEmail(email)) return res.status(400).json({ success: false, message: "A valid email is required" });
    if (await User.exists({ email, _id: { $ne: req.user.id } })) return res.status(409).json({ success: false, message: "Email is already in use" });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await Otp.deleteMany({ target: email, purpose: "change_email" });
    await Otp.create({ email, target: email, purpose: "change_email", otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: "OTP sent to your new email" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const verifyEmailChange = async (req, res) => {
  try {
    const email = emailOf(req.body.email), { otp } = req.body;
    const otpDoc = await Otp.findOne({ target: email, purpose: "change_email", otp, expiresAt: { $gt: new Date() } });
    if (!otpDoc) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    const user = await User.findByIdAndUpdate(req.user.id, { email }, { new: true, runValidators: true }).select("-password");
    await Otp.deleteMany({ target: email, purpose: "change_email" });
    res.json({ success: true, message: "Email updated", user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const logout = async (req, res) => {
  try { await TokenBlacklist.create({ token: req.token, expiresAt: new Date(req.user.exp * 1000) }); await User.findByIdAndUpdate(req.user.id, { lastLogoutAt: new Date() }); res.json({ success: true, message: "Logged out successfully" }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
module.exports = { requestOtp, verifyOtp, registerWithPassword, loginWithPassword, setPassword, requestEmailChange, verifyEmailChange, logout };
