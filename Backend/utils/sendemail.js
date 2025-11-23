const axios = require("axios");

async function sendEmail(recipient, subject, textContent, htmlContent) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { 
          name: "Job Portal",
          email: process.env.EMAIL_FROM     
        },
        to: [{ email: recipient }],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Email sent successfully to", recipient);

  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to send email.");
  }
}

module.exports = sendEmail;