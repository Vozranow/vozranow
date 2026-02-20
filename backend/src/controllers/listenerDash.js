import Session from "../models/session.js";
import ListenerProfile from "../models/listenerProfile.js";
import User from "../models/users.js";
import redis from "../lib/redis.js"; 
import mongoose from "mongoose";
// @desc    Get Listener Dashboard (Stats, Availability, Earnings)
// @route   GET /api/listener/dashboard
export const getListenerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `dashboard:listener:${userId}`;

    // 1️⃣ CHECK REDIS
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Prepare Date for Monthly Stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1); 
    startOfMonth.setHours(0,0,0,0);

    // 2️⃣ CACHE MISS - Execute in Parallel
    const [profile, upcomingSessions, monthlyStats, userDoc] = await Promise.all([
      
      // A. Listener Profile (Main Stats & Availability)
      ListenerProfile.findOne({ userId }),

      // B. Upcoming Sessions (Assigned/Ongoing)
      Session.find({
        listenerId: userId,
        status: { $in: ["assigned", "ongoing"] },
        // scheduledDate: { $gte: new Date() } // Optional: Strict future check
      })
      .sort({ scheduledDate: 1 })
      .limit(5)
      .populate("userId", "username"), // Show Client Name

      // C. Monthly Stats (Aggregation)
      Session.aggregate([
        {
          $match: {
            listenerId: new mongoose.Types.ObjectId(userId), // 👈 FORCE OBJECTID
            status: "completed",
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            sessionsThisMonth: { $sum: 1 },
            earnedThisMonth: { $sum: "$price" },
            minutesThisMonth: { $sum: "$actualDurationMinutes" }
          }
        }
      ]),

      // D. User Doc (For Header Info)
      User.findById(userId).select("username email")
    ]);

    if (!profile) return res.status(404).json({ message: "Listener profile not found" });

    // 3️⃣ PROCESS DATA
    const currentMonth = monthlyStats[0] || { 
      sessionsThisMonth: 0, 
      earnedThisMonth: 0, 
      minutesThisMonth: 0 
    };

    const responseData = {
      message: "Listener Dashboard fetched",
      user: {
        _id: userDoc._id,
        username: userDoc.username,
        email: userDoc.email,
      },
      overview: {
        totalSessions: profile.totalSessionsCompleted,
        // Estimate total hours (e.g., avg 45 mins) if you don't track it in profile
        totalHours: Math.round(profile.totalSessionsCompleted * 0.75), 
        totalEarnings: profile.totalEarnings,
        rating: profile.rating?.average?.toFixed(1) || "New",
      },
      monthlyEarnings: {
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        sessions: currentMonth.sessionsThisMonth,
        earnings: currentMonth.earnedThisMonth,
        hours: (currentMonth.minutesThisMonth / 60).toFixed(1)
      },
      availability: {
        isOnline: profile.isOnline,
        preferredDays: profile.preferredDays
      },
      upcomingSessions // The "Next Up" list
    };

    // 4️⃣ SAVE TO REDIS (5 Minutes)
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Listener Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Toggle Availability (Online/Offline)
// @route   PUT /api/listener/availability
export const toggleAvailability = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isOnline } = req.body; // true or false

    const profile = await ListenerProfile.findOneAndUpdate(
      { userId },
      { isOnline },
      { new: true }
    );
   await redis.del(`dashboard:listener:${userId}`);
    res.status(200).json({ 
      message: isOnline ? "You are now Online" : "You are now Offline", 
      isOnline: profile.isOnline 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update Preferred Days
// @route   PUT /api/listener/settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferredDays } = req.body; // e.g., ["Mon", "Wed"]

    const profile = await ListenerProfile.findOneAndUpdate(
      { userId },
      { preferredDays },
      { new: true }
    );
    
    await redis.del(`dashboard:listener:${userId}`);
    res.status(200).json({ 
      message: "Settings updated", 
      preferredDays: profile.preferredDays 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};