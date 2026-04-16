import cron from 'node-cron';
import Session from '../models/session.js'; 
import { emailQueue } from '../queues/emailQueue.js'; 

const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "suitshawn1@gmail.com";

// Schedule the cron job to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('[Watchdog] Scanning for unassigned sessions approaching deadline...');

    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

        // 1. Find all sessions that are pending AND starting within the next 2 hours
        const endangeredSessions = await Session.find({
            status: 'pending',
            preferredTimeStart: { $lte: twoHoursFromNow } 
        }).populate('userId', 'email');

        if (endangeredSessions.length === 0) {
            return; // Everything is fine!
        }

        console.log(`[Watchdog] Found ${endangeredSessions.length} sessions in the Danger Zone! Escaping them now.`);

        // 2. Map the sessions to an array of concurrent Promises
        const escalationPromises = endangeredSessions.map(async (session) => {
            
            // A. Update the database state in memory
            session.status = 'escalated';
            session.timeline.push({
                status: 'escalated',
                time: new Date(),
                note: 'System automatically escalated: 2-hour window breached without assignment.'
            });

            // B. Format the time beautifully
            const formattedTime = new Date(session.preferredTimeStart).toLocaleString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            // C. Execute BOTH the DB Save and the Redis Queue addition at the exact same time
            await Promise.all([
                session.save(),
                emailQueue.add('manager-escalation-alert', {
                    type: 'MANAGER_ESCALATION',
                    to: MANAGER_EMAIL,
                    sub: `URGENT: Unassigned Session - ${session._id}`,
                    payload: {
                        sessionId: session._id.toString(),
                        userEmail: session.userId.email,
                        scheduledTime: formattedTime
                    }
                })
            ]);
        });

        // 3. Wait for ALL sessions in the array to finish processing concurrently
        await Promise.all(escalationPromises);
        
        console.log('[Watchdog] All endangered sessions successfully escalated.');

    } catch (error) {
        console.error('[Watchdog] Error running cron job:', error);
    }
});