import cron from 'node-cron';
import Session from '../models/session.js'; // Adjust path to your Session model
import { emailQueue } from '../queues/emailQueue.js'; // Adjust path
// If you use an environment variable for the manager's email, grab it. Otherwise, hardcode for now.
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "suitshawn1@gmail.com";

// Schedule the cron job to run every 5 minutes
// '*/5 * * * *' means "At every 5th minute"
cron.schedule('*/5 * * * *', async () => {
    console.log('🐕 [Watchdog] Scanning for unassigned sessions approaching deadline...');

    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

        // 1. Find all sessions that are pending AND starting within the next 2 hours
        const endangeredSessions = await Session.find({
            status: 'pending',
            preferredTimeStart: { $lte: twoHoursFromNow } 
        }).populate('userId', 'email'); // Populate to get the user's email for the alert

        if (endangeredSessions.length === 0) {
            return; // Everything is fine!
        }

        console.log(`🚨 [Watchdog] Found ${endangeredSessions.length} sessions in the Danger Zone! Escaping them now.`);

        // 2. Loop through the dangerous sessions and escalate them
        for (const session of endangeredSessions) {
            
            // A. Update the database so we don't alert on this session again in 5 minutes
            session.status = 'escalated';
            session.timeline.push({
                status: 'escalated',
                time: new Date(),
                note: 'System automatically escalated: 2-hour window breached without assignment.'
            });
            await session.save();

            // B. Format the time beautifully
            const formattedTime = new Date(session.preferredTimeStart).toLocaleString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            // C. Fire the BullMQ Email Alert to the Manager
            await emailQueue.add('manager-escalation-alert', {
                type: 'MANAGER_ESCALATION',
                to: MANAGER_EMAIL,
                sub: `URGENT: Unassigned Session - ${session._id}`,
                payload: {
                    sessionId: session._id.toString(),
                    userEmail: session.userId.email,
                    scheduledTime: formattedTime
                }
            });
        }

    } catch (error) {
        console.error('❌ [Watchdog] Error running cron job:', error);
    }
});