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
        pass: process.env.PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const sendEmail = async (email, otp) => {
    if (!process.env.EMAIL || !process.env.PASS) {
        throw new Error("Email service is not configured");
    }

    return transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`,
    });
};

module.exports = sendEmail;