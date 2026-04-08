const SibApiV3Sdk = require("sib-api-v3-sdk");

const brevoApiKey = (process.env.BREVO_API_KEY || "").replace(/\s+/g, "");
const senderEmail = process.env.MAIL_FROM || process.env.EMAIL;
const senderName = process.env.BREVO_SENDER_NAME || "AuthSystem";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = brevoApiKey;

const sendEmail = async (email, otp) => {
    if (!brevoApiKey) {
        throw new Error("Brevo API key is not configured");
    }

    if (!senderEmail) {
        throw new Error("Brevo sender email is not configured");
    }

    if (!email) {
        throw new Error("Recipient email is required");
    }

    try {
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const result = await apiInstance.sendTransacEmail({
            sender: {
                email: senderEmail,
                name: senderName,
            },
            to: [{ email }],
            subject: "OTP Verification",
            textContent: `Your OTP is ${otp}`,
            htmlContent: `<p>Your OTP is <strong>${otp}</strong></p>`,
        });

        console.log("Email sent:", result);
        return result;
    } catch (error) {
        console.error("Brevo API Error:", error.response?.body || error.message || error);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

module.exports = sendEmail;