const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;
const fromEmail = process.env.MAIL_FROM || process.env.EMAIL;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
    family: 4,
    auth: {
        user: process.env.EMAIL,
        pass: (process.env.PASS || "").replace(/\s+/g, ""),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

let isTransportVerified = false;

const sendEmail = async (email, otp) => {
    if (!process.env.EMAIL || !process.env.PASS) {
        throw new Error("Email service is not configured");
    }

    if (!email) {
        throw new Error("Recipient email is required");
    }

    try {
        if (!isTransportVerified) {
            await transporter.verify();
            isTransportVerified = true;
        }

        return await transporter.sendMail({
            from: fromEmail || process.env.EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`,
        });
    } catch (error) {
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

module.exports = sendEmail;