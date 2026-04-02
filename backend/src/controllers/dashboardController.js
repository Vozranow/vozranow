import Session from "../models/session.js";
import WalletTransaction from "../models/walletTransaction.js";
import User from "../models/users.js";
import redis from "../lib/redis.js"; 
import mongoose from "mongoose";
import { getUserDashboardData } from '../services/dashboardService.js';

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Hand off to the service
    const result = await getUserDashboardData(userId);

    // Handle any potential errors (like user not found)
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    // Return the perfectly formatted dashboard data
    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Dashboard Error:", error);
    // Passing to your global error handler, or you can keep res.status(500)
    res.status(500).json({ message: "Server error" });
  }
};

// export const getUserDashboard = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const cacheKey = `dashboard:${userId}`;

//     // 1️⃣ CHECK REDIS
//     const cachedData = await redis.get(cacheKey);
//     if (cachedData) {
//       return res.status(200).json(JSON.parse(cachedData));
//     }

//     // 2️⃣ CACHE MISS
//     const [stats, upcomingSessions, pastSessions, recentTransactions, userDoc] = await Promise.all([
//       // A. Stats
//       Session.aggregate([
//         { 
//           $match: { 
//             userId: new mongoose.Types.ObjectId(userId), // 👈 Explicitly cast to ObjectId
//             status: "completed" 
//           } 
//         }, 
//         {
//           $group: {
//             _id: null,
//             totalSessions: { $sum: 1 },
//             totalTimeSpent: { $sum: "$actualDurationMinutes" },
//             totalSpent: { $sum: "$price" },
//             avgRatingGiven: { $avg: "$review.rating" } 
//           }
//         }
//       ]),
      
//       // B. Upcoming (Action Items)
//       Session.find({
//         userId,
//         status: { $in: ["pending", "assigned", "ongoing"] },
//         // scheduledDate: { $gte: new Date() } // Optional: strict future check
//       })
//       .sort({ scheduledDate: 1 }) // Soonest first
//       .limit(5)
//       .populate("listenerId", "username"),

//       // C. Past Sessions (Preview only - Limit 5) 🆕
//       Session.find({
//         userId,
//         status: { $in: ["completed", "cancelled"] }
//       })
//       .sort({ scheduledDate: -1 }) // Newest first
//       .limit(2)
//       .populate("listenerId", "username")
//       .select("scheduledDate status price listenerId review"),

//       // D. Wallet History
//       WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(3),
      
//       // E. Balance
//       User.findById(userId).select("walletBalance username email")
//     ]);

//     const userStats = stats[0] || {
//       totalSessions: 0,
//       totalTimeSpent: 0,
//       totalSpent: 0,
//       avgRatingGiven: 0
//     };

//     const responseData = {
//       message: "Dashboard data fetched",
//       user: {
//         _id: userDoc._id,
//         username: userDoc.username,
//         email: userDoc.email,
//       },
//       overview: {
//         walletBalance: userDoc.walletBalance,
//         totalSessions: userStats.totalSessions,
//         totalTimeMinutes: userStats.totalTimeSpent,
//         totalSpent: userStats.totalSpent,
//         avgRatingGiven: parseFloat(userStats.avgRatingGiven || 0).toFixed(1),
//       },
//       upcomingSessions, // The "Next Up" card
//       pastSessions,     // The "Recent History" card
//       walletHistory: recentTransactions,
//     };

//     // 3️⃣ SAVE TO REDIS (5 Minutes)
//     await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);

//     return res.status(200).json(responseData);

//   } catch (error) {
//     console.error("Dashboard Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };