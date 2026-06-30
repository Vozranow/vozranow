import { Queue } from 'bullmq';
import redis from '../lib/redis.js'; // Adjust this path to your redis file

// Initialize the Queue
export const emailQueue = new Queue('email-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // If Resend fails, BullMQ will try 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Wait 2s, 4s, 8s between retries
    },
    removeOnComplete: true, // Delete from Redis once sent to save memory
    removeOnFail: false,    // Keep failed jobs so you can debug them
  }
});