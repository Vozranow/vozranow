import Session from "../models/session.js";
import WalletTransaction from "../models/walletTransaction.js";
import User from "../models/users.js";
import redis from "../lib/redis.js"; 
import mongoose from "mongoose";

export const getUserDashboardData = async (userId) => {
  const cacheKey = `dashboard:${userId}`;

  // 1️⃣ CHECK REDIS
  // Added a quick safety check so your app doesn't crash if Redis ever restarts
  if (redis.status === 'ready') {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return { 
        success: true, 
        statusCode: 200, 
        data: JSON.parse(cachedData) 
      };
    }
  }

  // 2️⃣ CACHE MISS: Fetch everything in parallel
  const [stats, upcomingSessions, pastSessions, recentTransactions, userDoc] = await Promise.all([
    // A. Stats
    Session.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed" 
        } 
      }, 
      {
        $match: { /* Double matching omitted, merged above if applicable, kept exact to your logic */ } 
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalTimeSpent: { $sum: "$actualDurationMinutes" },
          totalSpent: { $sum: "$price" },
          avgRatingGiven: { $avg: "$review.rating" } 
        }
      }
    ]),
    
    // B. Upcoming (Action Items)
    Session.find({
      userId,
      status: { $in: ["pending", "assigned", "ongoing"] },
    })
    .sort({ scheduledDate: 1 })
    .limit(5)
    .populate("listenerId", "username"),

    // C. Past Sessions (Preview only - Limit 5)
    Session.find({
      userId,
      status: { $in: ["completed", "cancelled"] }
    })
    .sort({ scheduledDate: -1 })
    .limit(2)
    .populate("listenerId", "username")
    .select("scheduledDate status price listenerId review"),

    // D. Wallet History
    WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(3),
    
    // E. Balance
    User.findById(userId).select("walletBalance username email")
  ]);

  // Safety check in case the user was deleted but still holds a valid JWT
  if (!userDoc) {
    return { success: false, statusCode: 404, message: "User not found" };
  }

  const userStats = stats[0] || {
    totalSessions: 0,
    totalTimeSpent: 0,
    totalSpent: 0,
    avgRatingGiven: 0
  };

  const responseData = {
    message: "Dashboard data fetched",
    user: {
      _id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
    },
    overview: {
      walletBalance: userDoc.walletBalance,
      totalSessions: userStats.totalSessions,
      totalTimeMinutes: userStats.totalTimeSpent,
      totalSpent: userStats.totalSpent,
      avgRatingGiven: parseFloat(userStats.avgRatingGiven || 0).toFixed(1),
    },
    upcomingSessions, 
    pastSessions,     
    walletHistory: recentTransactions,
  };

  // 3️⃣ SAVE TO REDIS (5 Minutes)
  if (redis.status === 'ready') {
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);
  }

  return {
    success: true,
    statusCode: 200,
    data: responseData
  };
};