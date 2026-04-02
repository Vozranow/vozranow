import dotenv from "dotenv"

const isTestEnv = process.env.NODE_ENV === 'test';
const envFilePath = isTestEnv ? "./src/.env.test" : "./src/.env";
dotenv.config({ path: envFilePath, quiet: "true" });
//by default it looks in project root

export const ENV ={
    PORT: parseInt(process.env.PORT, 10),  //since env values are strings and express take only number we had to parse it into int
    DB_URL: process.env.DB_URL,
    NODE_ENV: process.env.NODE_ENV,
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
  
    RESEND_KEY: process.env.RESEND_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_SECRET,
    
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME
};