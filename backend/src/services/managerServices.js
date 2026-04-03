import Session from '../models/session.js';
import User from '../models/users.js';
import mongoose from 'mongoose';
import ListenerProfile from '../models/listenerProfile.js';
export const getDashboardMetrics = async () => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Run aggregations in parallel
    const [mainStats, retentionStats] = await Promise.all([
      
      // PIPELINE 1: Financials, Volume, Users, and Trends
      Session.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sixMonthsAgo } } },
        {
          $facet: {
            "thisMonth": [
              { $match: { createdAt: { $gte: startOfThisMonth } } },
              { $group: {
                  _id: null,
                  count: { $sum: 1 },
                  // Fallback to 20% of price if platformFee is missing on older sessions
                  solanceRevenue: { $sum: { $ifNull: ["$platformFee", { $multiply: ["$price", 0.20] }] } },
                  // Collect unique IDs to count ACTIVE users/listeners
                  uniqueUsers: { $addToSet: "$userId" },
                  uniqueListeners: { $addToSet: "$listenerId" }
              }}
            ],
            "lastMonth": [
              { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
              { $group: {
                  _id: null,
                  count: { $sum: 1 },
                  solanceRevenue: { $sum: { $ifNull: ["$platformFee", { $multiply: ["$price", 0.20] }] } },
                  uniqueUsers: { $addToSet: "$userId" },
                  uniqueListeners: { $addToSet: "$listenerId" }
              }}
            ],
            "sixMonthTrend": [
              { $group: {
                  _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                  revenue: { $sum: { $ifNull: ["$platformFee", { $multiply: ["$price", 0.20] }] } },
                  payouts: { $sum: { $ifNull: ["$listenerPayout", { $multiply: ["$price", 0.80] }] } }
              }},
              { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]
          }
        }
      ]),

      // PIPELINE 2: Client Retention (This Month)
      Session.aggregate([
        { $match: { status: "completed", createdAt: { $gte: startOfThisMonth } } },
        // First, count how many sessions each user had this month
        { $group: { _id: "$userId", sessionCount: { $sum: 1 } } },
        // Then, group them into "First-Time" (1 session) or "Repeat" (2+ sessions)
        { $group: {
            _id: { $cond: [{ $eq: ["$sessionCount", 1] }, "First-Time", "Repeat"] },
            totalSessionsInBucket: { $sum: "$sessionCount" }
        }}
      ])
    ]);

    // --- DATA EXTRACTION & FALLBACKS ---
    const stats = mainStats[0];

    const thisMonthData = stats.thisMonth[0] || { count: 0, solanceRevenue: 0, uniqueUsers: [], uniqueListeners: [] };
    const lastMonthData = stats.lastMonth[0] || { count: 0, solanceRevenue: 0, uniqueUsers: [], uniqueListeners: [] };

    const thisMonthRev = thisMonthData.solanceRevenue || 0;
    const lastMonthRev = lastMonthData.solanceRevenue || 0;
    
    const thisMonthSessions = thisMonthData.count || 0;
    const lastMonthSessions = lastMonthData.count || 0;

    // The length of the unique array = exactly how many active humans used the platform
    const thisMonthActiveUsers = thisMonthData.uniqueUsers.length;
    const lastMonthActiveUsers = lastMonthData.uniqueUsers.length;
    const thisMonthActiveListeners = thisMonthData.uniqueListeners.length;
    const lastMonthActiveListeners = lastMonthData.uniqueListeners.length;

    // Math helper to avoid dividing by zero
    const calcGrowth = (current, previous) => previous === 0 ? (current > 0 ? 100 : 0) : parseFloat((((current - previous) / previous) * 100).toFixed(1));

    // Dynamic Targets (Last Month + 15%)
    const targetRevenue = lastMonthRev === 0 ? 5000 : Math.round(lastMonthRev * 1.15);
    const targetSessions = lastMonthSessions === 0 ? 100 : Math.round(lastMonthSessions * 1.15);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // --- BUILD THE PERFECT JSON PAYLOAD ---
    return {
      success: true,
      statusCode: 200,
      data: {
        executiveSummary: {
          totalRevenue: thisMonthRev,
          revenueGrowth: calcGrowth(thisMonthRev, lastMonthRev),
          activeUsers: thisMonthActiveUsers,
          userGrowth: calcGrowth(thisMonthActiveUsers, lastMonthActiveUsers),
          totalSessions: thisMonthSessions,
          sessionGrowth: calcGrowth(thisMonthSessions, lastMonthSessions),
          activeListeners: thisMonthActiveListeners,
          listenerGrowth: calcGrowth(thisMonthActiveListeners, lastMonthActiveListeners)
        },
        monthlyGoals: {
          revenue: { 
            current: thisMonthRev, 
            target: targetRevenue, 
            progressPercent: Math.min(Math.round((thisMonthRev / targetRevenue) * 100), 100) || 0
          },
          sessions: { 
            current: thisMonthSessions, 
            target: targetSessions, 
            progressPercent: Math.min(Math.round((thisMonthSessions / targetSessions) * 100), 100) || 0
          }
        },
        retention: {
          firstTimeSessions: retentionStats.find(r => r._id === "First-Time")?.totalSessionsInBucket || 0,
          repeatSessions: retentionStats.find(r => r._id === "Repeat")?.totalSessionsInBucket || 0
        },
        historicalTrend: stats.sixMonthTrend.map(item => ({
          name: monthNames[item._id.month - 1], // Converts month '3' to 'Mar'
          revenue: item.revenue,
          payouts: item.payouts
        }))
      }
    };

  } catch (error) {
    console.error("Manager Dashboard Service Error:", error);
    throw error;
  }
};


export const getFinancialLedger = async (targetMonth, targetYear, page = 1, limit = 20) => {
  try {
    // 1. Create strict time-boundaries for the chosen month
    // Note: JS months are 0-indexed (0 = Jan, 1 = Feb)
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const skip = (page - 1) * limit;

    const [kpis, pendingPayouts, ledgerRecords, totalLedgerCount] = await Promise.all([
      
      // A. TIME-BOXED KPIs
      Session.aggregate([
        { $match: { status: "completed", createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $facet: {
            "profit": [
              { $group: { _id: null, total: { $sum: "$platformFee" } } }
            ],
            "liability": [
              { $match: { payoutStatus: "pending" } },
              { $group: { _id: null, total: { $sum: "$listenerPayout" } } }
            ]
          }
        }
      ]),

      // B. TIME-BOXED PAYOUT QUEUE
      Session.aggregate([
        { 
          $match: { 
            status: "completed", 
            payoutStatus: "pending",
            createdAt: { $gte: startDate, $lte: endDate } 
          } 
        },
        { 
          $group: {
            _id: "$listenerId",
            periodOwed: { $sum: "$listenerPayout" },
            sessionCountInPeriod: { $sum: 1 },
            unpaidSessions: {
              $push: {
                sessionId: "$_id",
                date: "$createdAt",
                durationMinutes: "$actualDurationMinutes",
                clientPaid: "$price",
                listenerEarned: "$listenerPayout"
              }
            }
          }
        },
        // Get Listener Info & Lifetime Earnings
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
        { $lookup: { from: "listenerprofiles", localField: "_id", foreignField: "userId", as: "profileInfo" } },
        { $unwind: "$userInfo" },
        { $unwind: "$profileInfo" },
        { 
          $project: {
            _id: 0,
            listenerId: "$_id",
            listenerName: "$userInfo.username",
            lifetimePaidOut: "$profileInfo.totalPaidOut",
            periodOwed: 1,
            sessionCountInPeriod: 1,
            unpaidSessions: 1
          }
        },
        { $sort: { periodOwed: -1, listenerName: 1 } }
      ]),

      // C. PAGINATED MASTER LEDGER
      Session.find({ status: { $in: ["completed", "cancelled", "refunded"] } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("createdAt status price listenerPayout platformFee payoutStatus")
        .populate("userId", "username")
        .populate("listenerId", "username"),

      // D. LEDGER COUNT (For Pagination Math)
      Session.countDocuments({ status: { $in: ["completed", "cancelled", "refunded"] } })
    ]);

    const profitForPeriod = kpis[0]?.profit[0]?.total || 0;
    const liabilityForPeriod = kpis[0]?.liability[0]?.total || 0;

    return {
      success: true,
      statusCode: 200,
      data: {
        currentView: { targetMonth, targetYear },
        kpis: { platformProfitForPeriod: profitForPeriod, totalLiabilityForPeriod: liabilityForPeriod },
        payoutQueue: pendingPayouts,
        historicalLedger: {
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalLedgerCount / limit),
            totalRecords: totalLedgerCount,
            hasNextPage: page * limit < totalLedgerCount
          },
          transactions: ledgerRecords
        }
      }
    };
  } catch (error) {
    console.error("Financial Ledger Service Error:", error);
    throw error;
  }
}; 

export const processListenerPayout = async (listenerId, targetMonth, targetYear) => {
  // We use a transaction to ensure money isn't lost if the server crashes halfway through
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // 1. Find the exact amount we are about to pay them for this specific month
    const pendingSessions = await Session.aggregate([
      { 
        $match: { 
          listenerId: new mongoose.Types.ObjectId(listenerId),
          status: "completed",
          payoutStatus: "pending",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, totalToPay: { $sum: "$listenerPayout" } } }
    ]).session(session);

    const amountToPay = pendingSessions[0]?.totalToPay || 0;

    if (amountToPay === 0) {
      await session.abortTransaction();
      return { success: false, statusCode: 400, message: "No pending payouts found for this listener in the selected period." };
    }

    // 2. Mark those specific sessions as paid
    await Session.updateMany(
      { 
        listenerId: new mongoose.Types.ObjectId(listenerId),
        status: "completed",
        payoutStatus: "pending",
        createdAt: { $gte: startDate, $lte: endDate }
      },
      { $set: { payoutStatus: "paid" } },
      { session }
    );

    // 3. Add to their lifetime payout tracker
    await ListenerProfile.findOneAndUpdate(
      { userId: listenerId },
      { $inc: { totalPaidOut: amountToPay } },
      { session }
    );

    await session.commitTransaction();
    
    return { 
      success: true, 
      statusCode: 200, 
      message: `Successfully processed $${amountToPay} payout for listener.` 
    };

  } catch (error) {
    await session.abortTransaction();
    console.error("Payout Processing Error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};


export const getListenerDirectory = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [listeners, totalCount] = await Promise.all([
      User.aggregate([
        // 1. Get all listeners
        { $match: { role: "listener" } },
        
        // 2. Attach their Profile Data
        { $lookup: { from: "listenerprofiles", localField: "_id", foreignField: "userId", as: "profile" } },
        { $unwind: "$profile" },
        
        // 3. Attach their 3 most recent written reviews
        { 
          $lookup: {
            from: "sessions",
            let: { listenerId: "$_id" },
            pipeline: [
              { 
                $match: { 
                  $expr: { $eq: ["$listenerId", "$$listenerId"] },
                  "review.comment": { $exists: true, $ne: "" } // Only get sessions with actual written feedback
                } 
              },
              { $sort: { "review.createdAt": -1 } },
              { $limit: 3 },
              { 
                $project: { 
                  _id: 0,
                  rating: "$review.rating", 
                  comment: "$review.comment", 
                  date: "$review.createdAt" 
                } 
              }
            ],
            as: "recentReviews"
          }
        },

        // 4. Clean up the final JSON output
        {
          $project: {
            id: "$_id",
            name: "$username",
            email: "$email",
            joinedAt: "$createdAt",
            isBanned: "$isBanned",
            isOnline: "$profile.isOnline",
            sessionsCompleted: "$profile.totalSessionsCompleted",
            averageRating: "$profile.rating.average",
            revenueGenerated: "$profile.totalEarnings",
            bio: "$profile.bio",
            preferredDays: "$profile.preferredDays",
            recentReviews: 1
          }
        },
        // Sort by newest listeners first, or highest rated. Let's do most sessions first.
        { $sort: { sessionsCompleted: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      User.countDocuments({ role: "listener" })
    ]);

    return {
      success: true,
      statusCode: 200,
      data: {
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalRecords: totalCount,
          hasNextPage: page * limit < totalCount
        },
        directory: listeners
      }
    };
  } catch (error) {
    console.error("Listener Directory Error:", error);
    throw error;
  }
};

export const banListenerAccount = async (listenerId) => {
  try {
    // 1. Flip the ban switch
    const user = await User.findByIdAndUpdate(listenerId, { isBanned: true }, { new: true });
    if (!user) return { success: false, statusCode: 404, message: "Listener not found" };

    // 2. Force them offline in their profile so they immediately disappear from the client app
    await ListenerProfile.findOneAndUpdate({ userId: listenerId }, { isOnline: false });

    // (Optional Future Step): You could also add logic here to automatically refund any 
    // "pending" future sessions they haven't completed yet.

    return { success: true, statusCode: 200, message: "Listener has been permanently banned and forced offline." };
  } catch (error) {
    console.error("Ban Listener Error:", error);
    throw error;
  }
};



export const getPlatformSessionLogs = async (page = 1, limit = 15, search = "") => {
  try {
    const skip = (page - 1) * limit;
    let query = {};

    // 🟢 NEW: The Search Logic
    if (search) {
      // 1. Find any users whose name or email matches the search
      const matchedUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } }, // 'i' makes it case-insensitive
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      // 2. Extract their IDs
      const userIds = matchedUsers.map(u => u._id);

      // 3. Tell the Session query to only return sessions involving these users
      query = {
        $or: [
          { userId: { $in: userIds } },
          { listenerId: { $in: userIds } }
        ]
      };
    }

    const [sessions, totalCount] = await Promise.all([
      Session.find(query) // 🟢 Pass the query here
        .populate("listenerId", "username email isBanned")
        .populate("userId", "username email")
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(query) // 🟢 And here!
    ]);

    return {
      success: true,
      statusCode: 200,
      data: {
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit) || 1, // Fallback to 1 if no results
          totalRecords: totalCount,
          hasNextPage: page * limit < totalCount
        },
        logs: sessions
      }
    };
  } catch (error) {
    console.error("Session Logs Error:", error);
    throw error;
  }
};



export const getEscalatedSessionsService = async () => {
  try {
    // 1. Find all escalated sessions
    const escalatedSessions = await Session.find({ status: "escalated" })
      .populate("userId", "username")
      .sort({ preferredTimeStart: 1 }) // Sort by closest deadline first
      .lean(); // Use lean() for faster query performance since we don't need Mongoose document methods here

    // 2. Format them exactly how the frontend modal expects them
    const formattedSessions = escalatedSessions.map(session => ({
      _id: session._id,
      clientName: session.userId?.username || "Unknown User",
      scheduledDate: session.scheduledDate,
      preferredTimeStart: session.preferredTimeStart,
      preferredTimeEnd: session.preferredTimeEnd,
      duration: session.bookedDurationMinutes,
      status: session.status
    }));

    // 3. Return using your project's standard response pattern
    return {
      success: true,
      statusCode: 200,
      data: formattedSessions
    };

  } catch (error) {
    console.error("Fetch Escalated Error:", error);
    throw error; // Throw it so the controller can catch it
  }
};