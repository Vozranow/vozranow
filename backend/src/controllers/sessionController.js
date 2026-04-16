import mongoose from "mongoose";
import Session from "../models/session.js";
import User from '../models/users.js';
import WalletTransaction from '../models/walletTransaction.js'; 
import { emailQueue } from '../queues/emailQueue.js';
import redis from "../lib/redis.js";
import listenerProfile from "../models/listenerProfile.js";
import * as sessionService from '../services/sessionService.js';

// @desc for applying session by user and debiting money from wallet after booking the session
export const applyForSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await sessionService.applyForSession(userId, req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (err) {
    console.error("Apply for Session Error:", err);
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
        status: { $in: ["completed", "cancelled", "disputed", "refunded"] } 
    };

    const sessions = await Session.find(query)
      .sort({ scheduledDate: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate("listenerId", "username"); // Show who they talked to`

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
    const startTime = session.startedAt || session.createdAt; 
    const durationMs = endedAt - new Date(startTime);
    const durationMinutes = Math.floor(durationMs / 60000); 

    // 2️⃣ Update Session Data
    session.status = "completed";
    session.recordingUrl = recordingUrl || null;
    session.endedAt = endedAt;
    session.actualDurationMinutes = durationMinutes > 0 ? durationMinutes : 1; // Minimum 1 min

    // 🕒 TIMELINE UPDATE 
    session.timeline.push({
      status: "completed",
      time: endedAt,
      note: `Session finished. Duration: ${durationMinutes} mins.`
    });
    
    await session.save();

     
    // Fallback to 20% of price ONLY IF it's an old pending session from before the schema update.
    const earningsToAdd = session.listenerPayout !== undefined 
      ? session.listenerPayout 
      : (session.price * 0.20);

    // 3️⃣ UPDATE LISTENER PROFILE STATS
    // We increment the total sessions and total earnings (with the platform fee deducted!)
    await listenerProfile.findOneAndUpdate(
      { userId: session.listenerId },
      {
        $inc: {
          totalSessionsCompleted: 1,
          totalEarnings: earningsToAdd // 👈 Uses the correct payout value
        }
      }
    );
    if (session.bookedDurationMinutes === 5 && session.price === 0) {
      await User.findByIdAndUpdate(session.userId, { 
        hasUsedFreeTrial: true 
      });
    }

    res.status(200).json({ success: true });

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


// @desc    Cancel an assigned session (User Side)
// @route   PUT /api/sessions/:sessionId/cancel
export const cancelSessionByUser = async (req, res) => {
    const sessionDoc = await mongoose.startSession();
    sessionDoc.startTransaction();

    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        // 1. Fetch Session
        const session = await Session.findById(sessionId).session(sessionDoc);

        if (!session) {
            await sessionDoc.abortTransaction();
            return res.status(404).json({ message: "Session not found." });
        }

        // 2. Security Check: Does this belong to the user?
        if (session.userId.toString() !== userId.toString()) {
            await sessionDoc.abortTransaction();
            return res.status(403).json({ message: "Unauthorized to cancel this session." });
        }

        // 3. Status Check: Only assigned sessions can be cancelled
        if (session.status !== "assigned") {
            await sessionDoc.abortTransaction();
            return res.status(400).json({ message: "You can only cancel a session that has been officially assigned." });
        }

        let refundPercentage = 100; // Default 
        const now = new Date();

        // 4. Time Window & Refund Math
        if (session.scheduledStartAt) {
            const timeUntilSessionMs = session.scheduledStartAt.getTime() - now.getTime();
            const minutesUntilSession = timeUntilSessionMs / (1000 * 60);
            const hoursUntilSession = timeUntilSessionMs / (1000 * 60 * 60);

            // A. THE LOCKDOWN: Less than 15 minutes
            if (minutesUntilSession <= 15) {
                await sessionDoc.abortTransaction();
                return res.status(400).json({ 
                    message: "Cancellations are not permitted within 15 minutes of the session start time. The lobby is opening." 
                });
            }

            // B. THE MATH: 24hr and 2hr windows
            if (hoursUntilSession >= 24) {
                refundPercentage = 100;
            } else if (hoursUntilSession >= 2) {
                refundPercentage = 50;
            } else {
                refundPercentage = 0;
            }
        }

        // 5. Calculate actual refund amount
        const refundAmount = session.price * (refundPercentage / 100);

        // 6. Execute Wallet Refund & Ledger Entry (Race-condition safe)
        if (refundAmount > 0) {
            // new: true ensures updatedUser contains the balance AFTER the $inc operation
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $inc: { walletBalance: refundAmount } },
                { session: sessionDoc, new: true } 
            );

            // Create the ledger entry
            await WalletTransaction.create(
                [{
                    userId: userId,
                    type: "REFUND",
                    amount: refundAmount,
                    balanceAfter: updatedUser.walletBalance,
                    referenceId: session._id.toString(),
                    status: "success",
                }],
                { session: sessionDoc }
            );
        }

        // 7. Update Session State
        const listenerIdToNotify = session.listenerId; // Save this before we clear it

        session.status = "cancelled";
        session.cancelledBy = userId;
        session.cancellationType = "user_request";
        session.cancellationReason = req.body?.reason || "User cancelled via dashboard.";
        
        // Record the refund accounting
        session.refund = {
            percentage: refundPercentage,
            amount: refundAmount,
            processedAt: now
        };

        session.timeline.push({
            status: "cancelled",
            time: now,
            note: `Cancelled by user. Refunded ${refundPercentage}% (₹${refundAmount}).`
        });

        await session.save({ session: sessionDoc });

        // 8. Commit Transaction
        await sessionDoc.commitTransaction();
        sessionDoc.endSession();

        // 9. Fire Background Events (Outside the transaction so it doesn't block)
        // Clear Redis Caches
        if (typeof redis !== 'undefined' && redis.status === 'ready') {
            await redis.del(`user:${userId}`); // Clear user cache for the wallet balance update
            await redis.del(`dashboard:${userId}`);
            if (listenerIdToNotify) await redis.del(`dashboard:listener:${listenerIdToNotify}`);
        }

        // Notify the Listener if they were already assigned
        if (listenerIdToNotify) {
            const listener = await User.findById(listenerIdToNotify).select('email username');
            const formattedTime = new Date(session.scheduledStartAt).toLocaleString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            await emailQueue.add('listener-cancellation-notice', {
                type: 'USER_CANCELLED_SESSION',
                to: listener.email,
                sub: "Session Cancelled - Vozranow",
                payload: {
                    speakerName: listener.username,
                    scheduledTime: formattedTime
                }
            });
        }

        // 10. Return Success
        return res.status(200).json({
            message: `Session successfully cancelled. ₹${refundAmount} has been refunded to your wallet.`,
            refundAmount,
            refundPercentage
        });

    } catch (error) {
        await sessionDoc.abortTransaction();
        sessionDoc.endSession();
        console.error("Cancel Session Error:", error);
        return res.status(500).json({ message: "Server error during cancellation." });
    }
};



// @desc    Report an issue with a session (User Side)
// @route   PUT /api/sessions/:sessionId/report-issue
export const reportSessionIssue = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        const { reason, details } = req.body;

        // 1. Validate Input
        const validReasons = ["Listener No-Show", "Technical Glitch", "Inappropriate Behavior", "Other"];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ message: "Invalid report reason selected." });
        }

        // 2. Fetch Session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        // 3. Security Check
        if (session.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to report this session." });
        }

        // 4. Status Check: Must be active or assigned
        if (!["assigned", "ongoing"].includes(session.status)) {
            return res.status(400).json({ 
                message: `Cannot report an issue for a session that is currently ${session.status}.` 
            });
        }

        // 5. Time Math & Validations
        const now = new Date();
        const scheduledStart = new Date(session.scheduledStartAt);
        const lobbyOpenTime = new Date(scheduledStart.getTime() - 15 * 60 * 1000); // T-15 mins
        const noShowThreshold = new Date(scheduledStart.getTime() + 10 * 60 * 1000); // T+10 mins

        // Rule A: Cannot report anything before the lobby even opens
        if (now < lobbyOpenTime) {
            return res.status(400).json({ 
                message: "You cannot report an issue before the session lobby has opened." 
            });
        }

        // Rule B: Specific block for "Listener No-Show"
        if (reason === "Listener No-Show" && now < noShowThreshold) {
            const minsLeft = Math.ceil((noShowThreshold.getTime() - now.getTime()) / (1000 * 60));
            return res.status(400).json({ 
                message: `Please wait ${minsLeft} more minute(s). Listeners have a 10-minute grace period to join.` 
            });
        }

        // 6. Update Session State
        session.status = "disputed";
        session.dispute = {
            reason: reason,
            details: details || "",
            reportedAt: now
        };

        session.timeline.push({
            status: "disputed",
            time: now,
            note: `User reported an issue: ${reason}`
        });

        await session.save();

        // 7. Clear Caches (So it instantly drops off their Upcoming UI)
        if (typeof redis !== 'undefined' && redis.status === 'ready') {
            await redis.del(`dashboard:${userId}`);
            if (session.listenerId) {
                await redis.del(`dashboard:listener:${session.listenerId}`);
            }
        }

        // 8. Return Success
        return res.status(200).json({
            message: "Issue reported successfully. The session is now under review by our management team.",
            session
        });

    } catch (error) {
        console.error("Report Issue Error:", error);
        return res.status(500).json({ message: "Server error while reporting issue." });
    }
};