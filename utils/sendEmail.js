
const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
    if (!process.env.EMAIL || !process.env.PASS) {
        throw new Error("Email service is not configured");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    await transporter.sendMail({
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`
    });
};

module.exports = sendEmail;