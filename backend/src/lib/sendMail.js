
import { ENV } from "./env.js";
import { Resend } from 'resend';

const resend = new Resend(ENV.RESEND_KEY);



export const sendResendEmail = async (to, subject, htmlContent) => {
  const { data, error } = await resend.emails.send({
    from: "Vozranow <support@mail.soumyodeep.online>",
    to: to,
    subject: subject,
    html: htmlContent,
  });

  if (error) {
    console.error("Resend Error:", error);
    throw error; 
  }
  return data;
};