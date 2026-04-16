
import { ENV } from "./env.js";
import { Resend } from 'resend';

const resend = new Resend(ENV.RESEND_KEY);

// export const sendOtpEmail = async (to, sub, otp) => {
//   const { data, error } = await resend.emails.send({
//     from: "Solance <support@mail.soumyodeep.online>",
//     to: to,
//     subject: sub,
//     html: verifyEmailHtml(otp),
//   });

//   if (error) {
//     return console.error({ error });
//   }

//   console.log({ data });
// };

// export const sendForgotEmail = async (to, sub, resetLink) => {
//   const { data, error } = await resend.emails.send({
//     from: "Solance <support@mail.soumyodeep.online>",
//     to: to,
//     subject: sub,
//     html: forgotPasswordEmailHtml(resetLink),
//   });

//   if (error) {
//     return console.error({ error });
//   }

//   console.log({ data });
// };

export const sendResendEmail = async (to, subject, htmlContent) => {
  const { data, error } = await resend.emails.send({
    from: "Solance <support@mail.soumyodeep.online>",
    to: to,
    subject: subject,
    html: htmlContent,
  });

  if (error) {
    console.error("Resend Error:", error);
    throw error; // tells BullMQ to retry
  }
  return data;
};