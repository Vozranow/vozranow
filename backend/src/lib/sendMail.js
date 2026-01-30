// import nodemailer from "nodemailer";
// import { ENV } from "./env.js";
// const transporter = nodemailer.createTransport({
//   secure: true,
//   host: 'smtp.gmail.com',
//   port: 465,
//   auth: {
//     user: 'soumyodeepc641@gmail.com',
//     pass: 'pnwfoigulfzgaztt'
//   }
// });

// export const sendOtpEmail = async(to, sub, msg) => {
//   transporter.sendMail({
//     to: to,
//     subject: sub,
//     html: msg
//   });
// }


import {verifyEmailHtml, forgotPasswordEmailHtml} from "./emailTemp.js";
import { ENV } from "./env.js";
import { Resend } from 'resend';

const resend = new Resend(ENV.RESEND_KEY);

export const sendOtpEmail = async (to, sub, otp) => {
  const { data, error } = await resend.emails.send({
    from: 'Solance <onboarding@resend.dev>',
    to: to,
    subject: sub,
    html: verifyEmailHtml(otp),
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
};

export const sendForgotEmail = async (to, sub, resetLink) => {
  const { data, error } = await resend.emails.send({
    from: 'Solance <onboarding@resend.dev>',
    to: to,
    subject: sub,
    html: forgotPasswordEmailHtml(resetLink),
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
};