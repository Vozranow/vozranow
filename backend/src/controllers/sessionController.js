import mongoose from "mongoose";
import Session from "../models/session.js";
import { debitWallet } from "./walletController.js";
import { SESSION_PLANS } from "../config/sessionPlans.js";
import redis from "../lib/redis.js";
import listenerProfile from "../models/listenerProfile.js";

// @desc for applying session by user and debiting money from wallet after booking the session
export const applyForSession = async (req, res, next) => {
  const userId = req.user._id;

  const {
    scheduledDate,
    preferredTimeStart,
    preferredTimeEnd,
    plan,
  } = req.body;

  // Validate required fields
  if (!scheduledDate || !preferredTimeStart || !preferredTimeEnd || !plan) {
    return res.status(400).json({
      message: "scheduledDate, preferredTimeStart, preferredTimeEnd and plan are required",
    });
  }

  //  Parse dates
  const dateOnly = new Date(scheduledDate);
  const windowStart = new Date(preferredTimeStart);
  const windowEnd = new Date(preferredTimeEnd);

  if (
    isNaN(dateOnly.getTime()) ||
    isNaN(windowStart.getTime()) ||
    isNaN(windowEnd.getTime())
  ) {
    return res.status(400).json({ message: "Invalid date/time values" });
  }


  // Helper to get IST hours
  const getISTHour = (date) => {
    return parseInt(date.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }), 10);
  };

  const startHourIST = getISTHour(windowStart);
  const endHourIST = getISTHour(windowEnd);

  // Rule 1: Start time cannot be between 00:00 (12 AM) and 07:59 (8 AM)
  // if (startHourIST >= 0 && startHourIST < 8) {
  //   return res.status(400).json({
  //     message: "Sessions cannot be booked between 12 AM and 8 AM IST.",
  //   });
  // }

  // Rule 2: Ensure window belongs to scheduledDate (Matches YYYY-MM-DD)
  // We compare just the date string part
  const dateString = dateOnly.toISOString().split('T')[0];
  const startString = windowStart.toISOString().split('T')[0];
  const endString = windowEnd.toISOString().split('T')[0];

  // if (startString !== dateString) {
  //    return res.status(400).json({ message: "Start time must be on the Scheduled Date." });
  // }

  // Rule 3: End time Edge Case (Spilling over to next day)
  // If endString is different, it means they selected 11:00 PM - 1:00 AM (Next Day)
  // if (endString !== dateString) {
  //    return res.status(400).json({ 
  //      message: "Session window cannot cross midnight (12 AM). Please finish before 11:59 PM.",
  //    });
  // }

 
  //Validate window logic (Duration)
  if (windowEnd <= windowStart) {
    return res.status(400).json({
      message: "preferredTimeEnd must be after preferredTimeStart",
    });
  }

  const windowMinutes = (windowEnd - windowStart) / (1000 * 60);
  
  // Strict 2-3 Hour Window Check
  if (windowMinutes < 120 || windowMinutes > 180) {
    return res.status(400).json({
      message: "Preferred time window must be between 2 to 3 hours.",
    });
  }

  // Validate plan
  const selectedPlan = SESSION_PLANS[plan];
  if (!selectedPlan) {
    return res.status(400).json({ message: "Invalid session plan" });
  }

  const { duration, price } = selectedPlan;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create session request
    const created = await Session.create(
      [
        {
          userId,
          scheduledDate: dateOnly,
          preferredTimeStart: windowStart,
          preferredTimeEnd: windowEnd,
          scheduledStartAt: null,
          status: "pending",
          bookedDurationMinutes: duration,
          price,
          timeline: [{
             status: "created",
             time: new Date(),
             note: "Session booked by user"
          }]
        },
      ],
      { session }
    );

    const newSession = created[0];

    // Debit wallet
    const result = await debitWallet({
      userId,
      amount: price,
      referenceId: newSession._id,
      reason: "SESSION",
      session, 
    });

    if (!result.success) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      // Handle specific wallet errors
      if (result.error === "WALLET_NOT_FOUND") {
        return res.status(400).json({ message: "Please add money to wallet first" });
      }
      if (result.error === "INSUFFICIENT_BALANCE") {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      // Catch-all for other wallet errors
      return res.status(500).json({ message: "Wallet transaction failed" });
    }

    await session.commitTransaction();
    session.endSession();

    // Clear Cache
    await redis.del(`dashboard:${userId}`);

    await redis.del(`user:${userId}`);

    return res.status(201).json({
      message: "Session request created successfully",
      session: {
        id: newSession._id,
        status: newSession.status,
        scheduledDate: newSession.scheduledDate,
        preferredWindow: {
          start: newSession.preferredTimeStart,
          end: newSession.preferredTimeEnd,
        },
        duration: newSession.bookedDurationMinutes,
        price: newSession.price,
      },
    });

  } catch (err) {
    if (session.inTransaction()) {
       await session.abortTransaction();
    }
    session.endSession();
    next(err);
  }
};

// @ desc if user can join the session room or not
export const canJoinSession = async (req, res, next) => {
  try {
    const userId = req.user._id.toString(); 
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate("listenerId", "username");

    if (!session) {
      return res.status(404).json({ allowed: false, message: "Session not found" });
    }

    // 1. Permission Check
    const isUser = session.userId.toString() === userId;
    const isListener = session.listenerId?._id.toString() === userId;

    if (!isUser && !isListener) {
      console.log("Permission Failed:", { isUser, isListener, userId }); // Debug log
      return res.status(403).json({ allowed: false, message: "Access denied" });
    }

    // 2. Status Check
    // Ideally, only 'assigned' (scheduled) or 'ongoing' sessions have open lobbies
    if (!["assigned", "ongoing"].includes(session.status)) {
      return res.status(400).json({ allowed: false, message: "Session is not scheduled or active" });
    }

    if (!session.scheduledStartAt) {
      return res.status(400).json({ allowed: false, message: "Start time not finalized by Admin yet" });
    }

    // 3. Time Check (Lobby opens 15 mins BEFORE scheduled start)
    // WAITING_ROOM_OFFSET_MINUTES should be 15
    const WAITING_ROOM_OFFSET_MINUTES = 15; 
    const now = new Date();
    
    // Calculate the exact time the doors open
    const joinAllowedFrom = new Date(
      new Date(session.scheduledStartAt).getTime() - WAITING_ROOM_OFFSET_MINUTES * 60 * 1000
    );

    if (now < joinAllowedFrom) {
      // Too early
      return res.status(403).json({
        allowed: false,
        message: `Lobby opens 15 minutes before the session (at ${joinAllowedFrom.toLocaleTimeString()})`,
        joinAllowedFrom,
      });
    }

    // ✅ 4. THE FIX: Update DB if Lobby isn't open yet
    // If we passed the time check, the lobby MUST be open now.
    if (!session.isLobbyOpen) {
        session.isLobbyOpen = true;
        
        // Optional: If you want to auto-move status to 'ongoing' when people join, do it here.
        // session.status = 'ongoing'; 

        await session.save(); // 💾 SAVE TO DB
    }

    // 5. Success Response
    return res.status(200).json({
      allowed: true,
      message: "Joining lobby...",
      session: {
        id: session._id,
        status: session.status,
        scheduledStartAt: session.scheduledStartAt,
        isLobbyOpen: true,// We know it's true now
        listenerId: {
          _id: session.listenerId._id,
          username: session.listenerId.username,
        },
      },
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get all past sessions with pagination
// @route   GET /api/sessions/history?page=1&limit=10
export const getSessionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find completed or cancelled sessions
    const query = { 
        userId, 
        status: { $in: ["completed", "cancelled"] } 
    };

    const sessions = await Session.find(query)
      .sort({ scheduledDate: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate("listenerId", "username"); // Show who they talked to

    const total = await Session.countDocuments(query);

    return res.status(200).json({
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
      }
    });

  } catch (error) {
    console.error("Session History Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc GET for getting history of listener sessions.
export const getListenerSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || "history"; // 'upcoming' or 'history'
    const skip = (page - 1) * limit;

    // 1. Build Dynamic Query
    let query = { listenerId: userId };
    let sortOption = {};

    if (type === "upcoming") {
      // Show assigned/ongoing sessions
      query.status = { $in: ["assigned", "ongoing"] };
      // Sort Ascending (Soonest date first)
      sortOption = { scheduledDate: 1 }; 
    } else {
      // Default: History (Completed/Cancelled)
      query.status = { $in: ["completed", "cancelled"] };
      // Sort Descending (Newest date first)
      sortOption = { scheduledDate: -1 };
    }

    // 2. Fetch Sessions
    const sessions = await Session.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email"); // Populate the CLIENT (Seeker) info

    // 3. Get Total Count (for pagination)
    const total = await Session.countDocuments(query);

    return res.status(200).json({
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
      }
    });

  } catch (error) {
    console.error("Listener Session Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// @desc POST to mark session as complete and update listener profile.

export const completeSession = async (req, res) => {
  try {
    const { sessionId, recordingUrl } = req.body;
    const userId = req.user._id.toString();

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 🛡️ SECURITY: Only Listener or Admin can complete
    if (session.listenerId?.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🛑 IDEMPOTENCY CHECK
    // If session is ALREADY marked completed, prevent double-counting stats.
    if (session.status === "completed") {
      return res.status(200).json({ message: "Session was already completed." });
    }

    // 1️⃣ Calculate Duration
    const endedAt = new Date();
    // Fallback to createdAt if actualStartAt is missing (e.g. if they started immediately)
    const startTime = session.startedAt; 
    const durationMs = endedAt - new Date(startTime);
    const durationMinutes = Math.floor(durationMs / 60000); 

    // 2️⃣ Update Session Data
    session.status = "completed";
    session.recordingUrl = recordingUrl || null;
    session.endedAt = endedAt;
    session.actualDurationMinutes = durationMinutes > 0 ? durationMinutes : 1; // Minimum 1 min

    // 🕒 TIMELINE UPDATE (The new part!)
    session.timeline.push({
      status: "completed",
      time: endedAt,
      note: `Session finished. Duration: ${durationMinutes} mins.`
    });
    
    await session.save();

    // 3️⃣ UPDATE LISTENER PROFILE STATS
    // We increment the total sessions and total minutes
    await listenerProfile.findOneAndUpdate(
      { userId: session.listenerId },
      {
        $inc: {
          totalSessionsCompleted: 1 ,
           totalEarnings: session.price
        }
      }
    );

    res.status(200).json({ success: true});

  } catch (error) {
    console.error("Complete Session Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc POST to review the session and update listener profile.
export const submitSessionReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sessionId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // 1. Find the Session (Regardless of status)
    const sessionDoc = await Session.findById(sessionId).session(session);

    if (!sessionDoc) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Session not found" });
    }

    // 2. Security: Only the Client can review
    if (sessionDoc.userId.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Only the client can review this session." });
    }

    // 3. Prevent Double Reviews
    if (sessionDoc.review && sessionDoc.review.rating) {
      await session.abortTransaction();
      return res.status(400).json({ message: "You have already reviewed this session." });
    }

    // 4. Save Review to Session
    sessionDoc.review = {
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date()
    };
    
    // Ensure status is completed (just in case they review before video upload finishes)
    // sessionDoc.status = "completed"; 
    
    await sessionDoc.save({ session });

    // 5. 🌟 AGGREGATION: Update Listener's Average Rating
    // We calculate the new average from ALL completed sessions
    const stats = await Session.aggregate([
      { $match: { listenerId: sessionDoc.listenerId, "review.rating": { $exists: true } } },
      { 
        $group: { 
          _id: "$listenerId", 
          avgRating: { $avg: "$review.rating" },
          totalReviews: { $sum: 1 } 
        } 
      }
    ]).session(session);

    // Update the Listener Profile with new stats
    if (stats.length > 0) {
      await listenerProfile.findOneAndUpdate(
        { userId: sessionDoc.listenerId },
        { 
          $set: { 
            "rating.average": stats[0].avgRating.toFixed(1), // e.g., "4.8"
            "rating.count": stats[0].totalReviews 
          } 
        },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(200).json({ success: true, message: "Review submitted successfully" });

  } catch (error) {
    await session.abortTransaction();
    console.error("Review Error:", error);
    res.status(500).json({ message: "Server error submitting review" });
  } finally {
    session.endSession();
  }
};

// @desc GET session details only listener and user to fetch the details in the feedback page.
export const getSessionDetails = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id.toString();
    const session = await Session.findById(sessionId)
      .select("userId listenerId status") // Only fetch these 3 fields!
      .populate("listenerId", "username")
      .populate("userId", "username");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Security: Only the assigned client or listener can view this
    if (session.userId._id.toString() !== userId && session.listenerId?._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to view this session" });
    }

    // Return the tiny, optimized payload
    return res.status(200).json({ session });

  } catch (err) {
    next(err);
  }
};