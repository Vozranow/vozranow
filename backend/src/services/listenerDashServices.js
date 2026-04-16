import Session from "../models/session.js";
import ListenerProfile from "../models/listenerProfile.js";
import User from "../models/users.js";
import redis from "../lib/redis.js"; 
import mongoose from "mongoose";

export const getDashboardData = async (userId) => {
  try {
    const cacheKey = `dashboard:listener:${userId}`;

    // 1️⃣ CHECK REDIS
    if (typeof redis !== 'undefined' && redis.status === 'ready') {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return { success: true, statusCode: 200, data: JSON.parse(cachedData) };
      }
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
        status: { $in: ["assigned", "ongoing"] }
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
            // 🟢 The crucial payout fix is here
            earnedThisMonth: { 
              $sum: { $ifNull: ["$listenerPayout", { $multiply: ["$price", 0.20] }] } 
            },
            minutesThisMonth: { $sum: "$actualDurationMinutes" }
          }
        }
      ]),

      // D. User Doc (For Header Info)
      User.findById(userId).select("username email")
    ]);

    if (!profile) {
      return { success: false, statusCode: 404, message: "Listener profile not found" };
    }
    if (!userDoc) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

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
    if (typeof redis !== 'undefined' && redis.status === 'ready') {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);
    }

    return { success: true, statusCode: 200, data: responseData };

  } catch (error) {
    console.error("Listener Dashboard Service Error:", error);
    throw error; // Throw the error so the controller's catch block can pass it to 'next(error)'
  }
};