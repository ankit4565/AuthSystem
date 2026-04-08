// controllers/authController.js
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");

const buildUserLookup = (email) => {
    return { email };
};

const sendOtpByEmail = async (email, otp) => {
    await sendEmail(email, otp);
};

const asyncHandler = (handler) => async (req, res) => {
    try {
        return await handler(req, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
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
        specialChars: false
    });

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpire: Date.now() + 5 * 60 * 1000
    });

    try {
        await sendOtpByEmail(email, otp);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }

    res.json({ message: "OTP sent", userId: user._id });
});


exports.verifyOtp = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await User.findById(userId);

    if (!user || user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ message: "Account verified" });
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

    res.json({ token });
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
        specialChars: false
    });

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    try {
        await sendOtpByEmail(email, otp);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }

    res.json({ message: "OTP sent" });
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

    res.json({ message: "OTP verified" });
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

    res.json({ message: "Password reset successful" });
});