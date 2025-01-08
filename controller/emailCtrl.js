const nodemailer = require("nodemailer");

const sendEmail = async (data) => {
    try {
        // Create a test account on Ethereal
        const testAccount = await nodemailer.createTestAccount();

        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for port 465, false for port 587
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        // Send the email
        const info = await transporter.sendMail({
            from: '"Hey" <abc@gmail.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        });

        // Log the message ID and preview URL
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        return `Email sent successfully! Preview: ${nodemailer.getTestMessageUrl(info)}`;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = sendEmail;
