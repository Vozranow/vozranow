import Session from "../models/session.js";
import ListenerProfile from "../models/listenerProfile.js";
import redis from "../lib/redis.js";
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
    const targetDate = new Date(session.scheduledDate);
    const sessionDay = days[targetDate.getDay()];

    // 3. Find Listeners who match this Day
    // We show both Online and Offline listeners, but mark status clearly
    const listeners = await ListenerProfile.find({
      preferredDays: sessionDay 
    })
    .populate("userId", "username email") // Get name
    .sort({ "rating.average": -1 }); // Default Sort: Best Rated First

    // 4. Smart Logic: Calculate workload & Tags for each listener
    const detailedListeners = await Promise.all(listeners.map(async (profile) => {
      
      // A. Check Workload: How many sessions do they ALREADY have on this date?
      const sessionsToday = await Session.countDocuments({
        listenerId: profile.userId._id,
        status: { $in: ["assigned", "ongoing"] },
        // Match the exact Calendar Date
        scheduledDate: { 
             $gte: new Date(targetDate.setHours(0,0,0,0)), 
             $lt: new Date(targetDate.setHours(23,59,59,999)) 
        }
      });

      // B. "New Listener" Logic (< 3 sessions total)
      const isNew = profile.totalSessionsCompleted < 3;

      // C. Tag Logic
      const tags = [];
      if (isNew) tags.push("New 🐣");
      
      // RECOMMENDATION LOGIC:
      // Recommend if: New Listener AND Short Session (<= 45m)
      // Warn if: Already has > 4 sessions today
      let status = profile.isOnline ? "Available" : "Unavailable";
      
      if (sessionsToday > 4) {
        status = "Overloaded"; 
        tags.push("Warning: High Load 🔴");
      } else if (isNew && session.bookedDurationMinutes <= 45) {
        tags.push("Recommended ✅");
      }

      return {
        listenerId: profile.userId._id,
        name: profile.userId.username,
        email: profile.userId.email,
        bio: profile.bio || "Ready to listen.", // Ensure your Profile model has 'bio'
        
        rating: profile.rating.average.toFixed(1),
        totalCompleted: profile.totalSessionsCompleted,
        
        // The data Admin needs to decide
        status: status, 
        bookingsOnDate: sessionsToday, // "He has 2 sessions this Tuesday"
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
export const assignSession = async (req, res) => {
  try {
    // 1️⃣ ID comes from the URL (Params)
    const { id } = req.params; 

    // 2️⃣ Data comes from the Body
    const { listenerId, finalStartTime } = req.body;
    const adminId = req.user._id; 

    if (!finalStartTime) {
        return res.status(400).json({ message: "You must set a specific start time." });
    }

    // Use 'id' from params here 👇
    const session = await Session.findById(id);
    
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "pending") {
        return res.status(400).json({ message: "Session already assigned" });
    }

    // Update Logic (Same as before)
    session.listenerId = listenerId;
    session.assignedBy = adminId;
    session.scheduledStartAt = new Date(finalStartTime);
    session.status = "assigned";
    
    session.timeline.push({
        status: "assigned",
        time: new Date(),
        note: `Assigned by Admin for ${new Date(finalStartTime).toLocaleTimeString()}`
    });
    const userId = session.userId;
    console.log(userId);
    await redis.del(`dashboard:${userId}`);
    await session.save();

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