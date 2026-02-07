import dotenv from "dotenv"
dotenv.config({ path: "./src/.env" , quiet: "true"});
//by default it lookss in project root

export const ENV ={
    PORT: parseInt(process.env.PORT, 10),  //since env values are strings and express take only number we had to parse it into int
    DB_URL: process.env.DB_URL,
    NODE_ENV: process.env.NODE_ENV,
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    RESEND_KEY: process.env.RESEND_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_SECRET
};