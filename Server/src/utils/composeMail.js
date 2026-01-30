import nodemailer from 'nodemailer'
import dotenv from "dotenv"


dotenv.config();

const transporter = nodemailer.createTransport({
    secure:true,
    host:'smtp.gmail.com',
    port:465,
    auth:{
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
    }
})

export async function sendMail({ to, sub, msg }) {
    console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS EXISTS:", !!process.env.MAIL_PASS);
    return await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject: sub,
        html: msg,
    });
}