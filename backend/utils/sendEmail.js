const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;
const smtpUser = process.env.SMTP_USER || process.env.EMAIL;
const smtpPass = process.env.SMTP_PASS || process.env.PASS;
const fromEmail = process.env.MAIL_FROM || smtpUser;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
    family: 4,
    auth: {
        user: smtpUser,
        pass: (smtpPass || "").replace(/\s+/g, ""),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

let isTransportVerified = false;

const sendEmail = async (email, otp) => {
    if (!smtpUser || !smtpPass) {
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
            from: fromEmail || smtpUser,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`,
        });
    } catch (error) {
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

module.exports = sendEmail;