const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const SendEmailMessage = asyncHandler(async (to, subject, htmlTemplate) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        html: htmlTemplate,
    };
    
    transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {
            return next(new ApiError(500, "Error sending email"));
        }
    });
});

module.exports = SendEmailMessage;