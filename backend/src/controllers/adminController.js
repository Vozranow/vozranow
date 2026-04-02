import Session from "../models/session.js";
import ListenerProfile from "../models/listenerProfile.js";
import redis from "../lib/redis.js";
import User from "../models/users.js";
import { getMatchHistoryData , getAdminProfileData} from '../services/adminServices.js';
import { emailQueue } from '../queues/emailQueue.js';
// @desc    Get all pending session requests (Nearest First)
// @route   GET /api/admin/requests
export const getPendingSessions = async (req, res) => {
  try {
    // 1. Fetch sessions with status "pending"
    // 2. Populate User details (username, email)
    // 3. Sort by scheduledDate ASC (Oldest/Nearest date at the top)
    const sessions = await Session.find({ status: "pending" })
      .populate("userId", "username email") 
      .sort({ scheduledDate: 1 });

    // 4. Format the data for the Admin Dashboard
    const formattedSessions = sessions.map((session) => ({
      _id: session._id,
      clientName: session.userId.username,
      clientEmail: session.userId.email, 
      
      // The Date User Selected
      scheduledDate: session.scheduledDate,

      // The Time Window User Selected
      preferredTimeStart: session.preferredTimeStart,
      preferredTimeEnd: session.preferredTimeEnd,

      duration: session.bookedDurationMinutes, // e.g., 60
      planType: session.planType || "Standard",
      
      requestedAt: session.createdAt, // When did they book?
    }));

    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Admin Requests Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get eligible listeners for a specific session
// @route   GET /api/admin/find-listeners/:sessionId
export const getListenersForAssignment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1. Get Session Details to know the Date
    const session = await Session.findById(sessionId).populate("userId", "username");
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 2. Determine Day of Week (e.g., "Mon", "Tue")
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sessionDate = new Date(session.scheduledDate);
    const sessionDay = days[sessionDate.getDay()];

    // 🟢 BUG FIX: Calculate Start and End of Day ONCE, outside the loop!
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Find Listeners who match this Day
    const listeners = await ListenerProfile.find({
      preferredDays: sessionDay 
    })
    .populate("userId", "username email") 
    .sort({ "rating.average": -1 }); 

    // 4. Smart Logic: Calculate workload, schedules, & Tags for each listener
    const detailedListeners = await Promise.all(listeners.map(async (profile) => {
      
      // A. Fetch the actual existing sessions for that day, not just the count!
      const sessionsTodayData = await Session.find({
        listenerId: profile.userId._id,
        status: { $in: ["assigned", "ongoing"] },
        // Match the exact Calendar Date using the safe variables
        scheduledDate: { 
             $gte: startOfDay, 
             $lt: endOfDay 
        }
      }).select("scheduledStartAt bookedDurationMinutes"); // Only grab timing data

      const sessionsTodayCount = sessionsTodayData.length;

      // B. "New Listener" Logic (< 3 sessions total)
      const isNew = profile.totalSessionsCompleted < 3;

      // C. Tag Logic
      const tags = [];
      if (isNew) tags.push("New 🐣");
      
      // RECOMMENDATION LOGIC
      let status = profile.isOnline ? "Available" : "Unavailable";
      
      if (sessionsTodayCount > 4) {
        status = "Overloaded"; 
        tags.push("Warning: High Load 🔴");
      } else if (isNew && session.bookedDurationMinutes <= 45) {
        tags.push("Recommended ✅");
      }

      return {
        listenerId: profile.userId._id,
        name: profile.userId.username,
        email: profile.userId.email,
        bio: profile.bio || "Ready to listen.", 
        rating: profile.rating?.average ? profile.rating.average.toFixed(1) : "0.0",
        totalCompleted: profile.totalSessionsCompleted,
        
        // The data Admin needs to decide
        status: status, 
        bookingsOnDate: sessionsTodayCount, 
        
        // 🟢 NEW: Send the exact schedule to the frontend to draw unavailable blocks
        existingSchedule: sessionsTodayData.map(s => {
            const start = new Date(s.scheduledStartAt);
            const end = new Date(start.getTime() + (s.bookedDurationMinutes * 60000)); // mins to ms
            return { start, end };
        }),

        tags: tags,
        availability: profile.preferredDays,
      };
    }));

    // 5. Send Response
    res.status(200).json({
      sessionContext: {
        clientName: session.userId.username,
        date: session.scheduledDate.toDateString(),
        windowStart: session.preferredTimeStart,
        windowEnd: session.preferredTimeEnd,
        duration: session.bookedDurationMinutes
      },
      listeners: detailedListeners
    });

  } catch (error) {
    console.error("Listener Search Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/adminController.js
//PUT /api/admin/sessions/:id/assign
// export const assignSession = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     const { listenerId, finalStartTime } = req.body;
//     const adminId = req.user._id; 

//     if (!finalStartTime) {
//         return res.status(400).json({ message: "You must set a specific start time." });
//     }

//     // 🟢 NEW: Validate Listener Exists & Role Check
//     const listener = await User.findById(listenerId);
//     if (!listener) {
//         return res.status(404).json({ message: "Listener not found in database." });
//     }
//     if (listener.role !== 'listener') {
//         return res.status(400).json({ message: "Selected user is not a registered listener." });
//     }
//     // 🟢 END NEW CHECK

//     const session = await Session.findById(id);
    
//     if (!session) return res.status(404).json({ message: "Session not found" });
    
//     if (session.status !== "pending") {
//         return res.status(400).json({ message: "Session already assigned or completed" });
//     }

//     // ---------------------------------------------------------
//     // 🚨 TIME WINDOW VALIDATION LOGIC START
//     // ---------------------------------------------------------

//     const adminStart = new Date(finalStartTime);
//     const userWindowStart = new Date(session.preferredTimeStart);
//     const userWindowEnd = new Date(session.preferredTimeEnd);

//     // Check 1: Is Admin Start Time VALID? (Must be a real date)
//     if (isNaN(adminStart.getTime())) {
//         return res.status(400).json({ message: "Invalid Start Time format" });
//     }

//     // Check 2: Too Early? (Admin sets time BEFORE user's window opens)
//     if (adminStart < userWindowStart) {
//         return res.status(400).json({ 
//             message: `Cannot start before User's preferred time (${userWindowStart.toLocaleString()})` 
//         });
//     }

//     // Check 3: Too Late? (Does the Session Duration spill outside the window?)
//     // Logic: AdminStart + SessionDuration MUST BE <= UserWindowEnd
    
//     const durationInMs = session.bookedDurationMinutes * 60 * 1000; // Convert mins to ms
//     const sessionEndTime = new Date(adminStart.getTime() + durationInMs);

//     if (sessionEndTime > userWindowEnd) {
//         return res.status(400).json({ 
//             message: `Session duration (${session.bookedDurationMinutes} mins) exceeds the user's window. Session would end at ${sessionEndTime.toLocaleTimeString()}, but window closes at ${userWindowEnd.toLocaleTimeString()}.`
//         });
//     }

//     // ---------------------------------------------------------
//     // 🚨 VALIDATION END
//     // ---------------------------------------------------------

//     // Update Logic
//     session.listenerId = listenerId;
//     session.assignedBy = adminId;
//     session.scheduledStartAt = adminStart;
//     session.status = "assigned";
    
//     session.timeline.push({
//         status: "assigned",
//         time: new Date(),
//         note: `Assigned by Admin for ${adminStart.toLocaleString()}`
//     });

//     const userId = session.userId;
    
//     // Clear Dashboard Cache for User
//     await redis.del(`dashboard:${userId}`);

//     await redis.del(`dashboard:listener:${listenerId}`)
    
//     await session.save();

//     // Populate for response
//     await session.populate("listenerId", "username email");
//     await session.populate("userId", "username");

//     res.status(200).json({ 
//         message: "Session successfully assigned!", 
//         session 
//     });

//   } catch (error) {
//     console.error("Assign Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const assignSession = async (req, res) => {
  try {
    const { id } = req.params; 
    const { listenerId, finalStartTime } = req.body;
    const adminId = req.user._id; 

    if (!finalStartTime) {
        return res.status(400).json({ message: "You must set a specific start time." });
    }

    // 🟢 Validate Listener Exists & Role Check
    const listenerDoc = await User.findById(listenerId).select("username email role");
    if (!listenerDoc) {
        return res.status(404).json({ message: "Listener not found in database." });
    }
    if (listenerDoc.role !== 'listener') {
        return res.status(400).json({ message: "Selected user is not a registered listener." });
    }

    const session = await Session.findById(id);
    
    if (!session) return res.status(404).json({ message: "Session not found" });
    
    if (session.status !== "pending") {
        return res.status(400).json({ message: "Session already assigned or completed" });
    }

    // ---------------------------------------------------------
    // 🚨 TIME WINDOW VALIDATION LOGIC START
    // ---------------------------------------------------------

    const adminStart = new Date(finalStartTime);
    const userWindowStart = new Date(session.preferredTimeStart);
    const userWindowEnd = new Date(session.preferredTimeEnd);
    if (adminStart < userWindowStart) {
        const potentialRollover = new Date(adminStart);
        potentialRollover.setDate(potentialRollover.getDate() + 1);
        
        // If adding a day puts it inside the correct window, auto-correct it!
        if (potentialRollover >= userWindowStart && potentialRollover <= userWindowEnd) {
            adminStart = potentialRollover; 
        }
    }

    // Check 1: Is Admin Start Time VALID? (Must be a real date)
    if (isNaN(adminStart.getTime())) {
        return res.status(400).json({ message: "Invalid Start Time format" });
    }

    // Check 2: Too Early? (Admin sets time BEFORE user's window opens)
    if (adminStart < userWindowStart) {
        return res.status(400).json({ 
            message: `Cannot start before User's preferred time (${userWindowStart.toLocaleString()})` 
        });
    }

    // Check 3: Too Late? (Does the Session Duration spill outside the window?)
    // Logic: AdminStart + SessionDuration MUST BE <= UserWindowEnd
    
    const durationInMs = session.bookedDurationMinutes * 60 * 1000; // Convert mins to ms
    const sessionEndTime = new Date(adminStart.getTime() + durationInMs);

    if (sessionEndTime > userWindowEnd) {
        return res.status(400).json({ 
            message: `Session duration (${session.bookedDurationMinutes} mins) exceeds the user's window. Session would end at ${sessionEndTime.toLocaleTimeString()}, but window closes at ${userWindowEnd.toLocaleTimeString()}.`
        });
    }

    // ---------------------------------------------------------
    // 🚨 VALIDATION END
    // ---------------------------------------------------------

    // Update Logic
    session.listenerId = listenerId;
    session.assignedBy = adminId;
    session.scheduledStartAt = adminStart;
    session.status = "assigned";
    
    session.timeline.push({
        status: "assigned",
        time: new Date(),
        note: `Assigned by Admin for ${adminStart.toLocaleString()}`
    });

    await session.save();

    // Fetch User details for the emails (we already fetched listenerDoc above)
    const user = await User.findById(session.userId).select("username email");

    const formattedTime = adminStart.toLocaleString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    // 🟢 NEW: Queue Email for the User
    await emailQueue.add('assign-user', {
        type: 'SESSION_ASSIGNED_USER',
        to: user.email,
        sub: "Session Confirmed - Solance",
        payload: {
            username: user.username,
            speakerName: listenerDoc.username, // Using the listener document we fetched earlier
            startTime: formattedTime
        }
    });

    // 🟢 NEW: Queue Email for the Listener (Speaker)
    await emailQueue.add('assign-speaker', {
        type: 'SESSION_ASSIGNED_SPEAKER',
        to: listenerDoc.email,
        sub: "New Session Assignment - Solance",
        payload: {
            speakerName: listenerDoc.username,
            startTime: formattedTime,
            duration: session.bookedDurationMinutes
        }
    });

    const userId = session.userId;
    
    // Clear Dashboard Cache for User and Listener
    await redis.del(`dashboard:${userId}`);
    await redis.del(`dashboard:listener:${listenerId}`);

    // Populate for response
    await session.populate("listenerId", "username email");
    await session.populate("userId", "username");

    res.status(200).json({ 
        message: "Session successfully assigned!", 
        session 
    });

  } catch (error) {
    console.error("Assign Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get history of all sessions assigned by this admin
// @route   GET /api/admin/history
export const getAdminMatchHistory = async (req, res, next) => {
  try {
    const adminId = req.user._id; 
    
    // 🟢 Grab page and limit from the URL, default to page 1, limit 5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const result = await getMatchHistoryData(adminId, page, limit);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Admin Match History Error:", error);
    res.status(500).json({ message: "Server error fetching match history" });
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    
    // Hand off to the service
    const result = await getAdminProfileData(adminId);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Admin Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};