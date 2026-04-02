// import { Worker } from 'bullmq';
// import redis from '../lib/redis.js'; // Adjust path
// import { sendOtpEmail, sendForgotEmail } from '../lib/sendMail.js'; // Adjust path to your mailer file

// const emailWorker = new Worker('email-queue', async (job) => {
//   // 1. Unpack the job data
//   const { type, to, sub, payload } = job.data;
  
//   console.log(`[BullMQ] Processing ${type} email for ${to}...`);

//   // 2. Route the job to the correct Resend function
//   try {
//     if (type === 'OTP') {
//       await sendOtpEmail(to, sub, payload.otp);
//     } 
//     else if (type === 'FORGOT_PASSWORD') {
//       await sendForgotEmail(to, sub, payload.resetLink);
//     }
    
//     console.log(`✅ [BullMQ] Successfully sent ${type} email to ${to}`);
//   } catch (error) {
//     console.error(`❌ [BullMQ] Failed to send ${type} email to ${to}`, error);
//     throw error; // Throwing tells BullMQ to retry!
//   }
// }, { 
//   connection: redis,
//   concurrency: 5 // Process up to 5 emails concurrently
// });

// export default emailWorker;

import { Worker } from 'bullmq';
import redis from '../lib/redis.js'; 
import { sendResendEmail } from '../lib/sendMail.js'; 
import { 
  verifyEmailHtml, 
  forgotPasswordEmailHtml, 
  sessionAssignedUserHtml, 
  sessionAssignedSpeakerHtml ,
  managerEscalationHtml
} from '../lib/emailTemp.js';

const emailWorker = new Worker('email-queue', async (job) => {
  const { type, to, sub, payload } = job.data;
  let htmlContent = '';

  // 1. Generate the correct HTML based on the job type
  switch (type) {
    case 'OTP':
      htmlContent = verifyEmailHtml(payload.otp);
      break;
    case 'FORGOT_PASSWORD':
      htmlContent = forgotPasswordEmailHtml(payload.resetLink);
      break;
    case 'SESSION_ASSIGNED_USER':
      htmlContent = sessionAssignedUserHtml(payload.username, payload.speakerName, payload.startTime);
      break;
    case 'SESSION_ASSIGNED_SPEAKER':
      htmlContent = sessionAssignedSpeakerHtml(payload.speakerName, payload.startTime, payload.duration);
      break;

    case 'MANAGER_ESCALATION':
      htmlContent = managerEscalationHtml(payload.sessionId, payload.userEmail, payload.scheduledTime);
      break;
      
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  // 2. Actually send the email
  await sendResendEmail(to, sub, htmlContent);
  console.log(`✅ [Worker] Sent ${type} to ${to}`);

}, { connection: redis , concurrency : 5});

emailWorker.on('completed', (job) => {
  console.log(`✅ [Worker] Successfully processed job ${job.id} (${job.data.type} -> ${job.data.to})`);
});

//  Listen for a job that failed (even after 3 retries)
emailWorker.on('failed', (job, err) => {
  console.error(`❌ [Worker] CRITICAL FAILURE: Job ${job.id} failed after all retries.`);
  console.error(`Reason: ${err.message}`);
  
});

// 3. Listen for system-level errors 
emailWorker.on('error', (err) => {
  console.error(`🚨 [Worker System Error]: ${err.message}`);
});

export default emailWorker;