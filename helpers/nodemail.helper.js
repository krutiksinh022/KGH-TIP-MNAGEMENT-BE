import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
        });
    
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        };
    
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}