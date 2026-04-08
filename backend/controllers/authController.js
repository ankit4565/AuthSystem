// controllers/authController.js
const User = require("../models/users");
const PendingUser = require("../models/pendingUsers");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");

const buildUserLookup = (email) => ({ email });

const sendOtpByEmail = async (email, otp) => {
  try {
    await sendEmail(email, otp);
  } catch (error) {
    console.error("OTP email failed:", error);
    throw new Error(`Unable to send OTP email: ${error.message}`);
  }
};

const asyncHandler = (handler) => async (req, res) => {
  try {
    return await handler(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne(buildUserLookup(email));
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const pendingUser = await PendingUser.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendOtpByEmail(email, otp);

  return res.json({ message: "OTP sent", userId: pendingUser._id });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: "User ID and OTP are required" });
  }

  const pendingUser = await PendingUser.findById(userId);
  if (!pendingUser || pendingUser.otp !== otp || !pendingUser.otpExpire || pendingUser.otpExpire < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const existingUser = await User.findOne(buildUserLookup(pendingUser.email));
  if (existingUser) {
    await PendingUser.deleteOne({ _id: pendingUser._id });
    return res.status(400).json({ message: "User already exists" });
  }

  await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
    isVerified: true,
  });

  await PendingUser.deleteOne({ _id: pendingUser._id });

  return res.json({ message: "Account created successfully" });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne(buildUserLookup(email));
  if (!user) return res.status(400).json({ message: "User not found" });
  if (!user.isVerified) return res.status(400).json({ message: "Account not verified" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = generateToken(user._id);
  return res.json({ token });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne(buildUserLookup(email));
  if (!user) return res.status(400).json({ message: "User not found" });

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  user.otp = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendOtpByEmail(email, otp);

  return res.json({ message: "OTP sent" });
});

exports.verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const user = await User.findOne(buildUserLookup(email));
  if (!user || user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  return res.json({ message: "OTP verified" });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  const user = await User.findOne(buildUserLookup(email));
  if (!user || user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  await user.save();

  return res.json({ message: "Password reset successful" });
});
