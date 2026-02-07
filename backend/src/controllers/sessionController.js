import mongoose from "mongoose";
import Session from "../models/session.js";
import { debitWallet } from "./walletController.js";
import { SESSION_PLANS } from "../config/sessionPlans.js";
import redis from "../lib/redis.js";
// @desc for applying session by user and debiting money from wallet after booking the session
export const applyForSession = async (req, res, next) => {
  const userId = req.user._id;

  const {
    scheduledDate,
    preferredTimeStart,
    preferredTimeEnd,
    plan,
  } = req.body;

  // 1️⃣ Validate required fields
  if (!scheduledDate || !preferredTimeStart || !preferredTimeEnd || !plan) {
    return res.status(400).json({
      message: "scheduledDate, preferredTimeStart, preferredTimeEnd and plan are required",
    });
  }

  // 2️⃣ Parse dates
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

  // 3️⃣ Validate window logic
  if (windowEnd <= windowStart) {
    return res.status(400).json({
      message: "preferredTimeEnd must be after preferredTimeStart",
    });
  }

  const windowMinutes = (windowEnd - windowStart) / (1000 * 60);
  if (windowMinutes < 120 || windowMinutes > 180) {
    return res.status(400).json({
      message: "Time window must be between 2 to 3 hours",
    });
  }

  // 4️⃣ Ensure window belongs to scheduledDate
  if (
    windowStart.toDateString() !== dateOnly.toDateString() ||
    windowEnd.toDateString() !== dateOnly.toDateString()
  ) {
    return res.status(400).json({
      message: "Time window must be on the same date as scheduledDate",
    });
  }

  // 5️⃣ Validate plan
  const selectedPlan = SESSION_PLANS[plan];
  if (!selectedPlan) {
    return res.status(400).json({ message: "Invalid session plan" });
  }

  const { duration, price } = selectedPlan;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 6️⃣ Create session request (NO exact time yet, kyuki admin ne assign nhi kiya)
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
          
          // 👇 CHANGE 2: Add initial timeline entry
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

    // 7️⃣ Debit wallet
    const result= await debitWallet({
      userId,
      amount: price,
      referenceId: newSession._id,
      reason: "SESSION",
      session, // SAME SESSION
    });
    if (!result.success) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      if (result.error === "WALLET_NOT_FOUND") {
        return res.status(400).json({
          message: "Please add money to wallet first",
        });
      }

      if (result.error === "INSUFFICIENT_BALANCE") {
        return res.status(400).json({
          message: "Insufficient wallet balance",
        });
      }
    }


    await session.commitTransaction();
    session.endSession();
    //CHANGE 3: Clear Dashboard Cache
    // So the new session appears in "Upcoming" and Wallet decreases immediately
    await redis.del(`dashboard:${userId}`);

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
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @ desc if user can join the session room or not
const WAITING_ROOM_OFFSET_MINUTES = 15;
export const canJoinSession = async (req, res, next) => {
  try {
    const userId = req.user._id.toString(); // Convert to string for comparison
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ allowed: false, message: "Session not found" });
    }

    // CHANGE 4: Allow BOTH User and Listener to join
    const isUser = session.userId.toString() === userId;
    const isListener = session.listenerId?.toString() === userId;

    if (!isUser && !isListener) {
      return res.status(403).json({ allowed: false, message: "Access denied" });
    }

    // Check status
    if (!["assigned", "ongoing"].includes(session.status)) {
      return res.status(400).json({ allowed: false, message: "Session not ready" });
    }

    if (!session.scheduledStartAt) {
      return res.status(400).json({ allowed: false, message: "Time not finalized by Admin yet" });
    }

    // Time Check (15 min window)
    const now = new Date();
    const joinAllowedFrom = new Date(
      session.scheduledStartAt.getTime() - WAITING_ROOM_OFFSET_MINUTES * 60 * 1000
    );

    if (now < joinAllowedFrom) {
      return res.status(403).json({
        allowed: false,
        message: "Waiting room is not open yet",
        joinAllowedFrom,
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      allowed: true,
      message: "Joining lobby...",
      session: {
        id: session._id,
        status: session.status,
        scheduledStartAt: session.scheduledStartAt,
        // 👇 CRITICAL: Send the Meet Link to the frontend
        meetLink: session.meetLink, 
        isLobbyOpen: true
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


// @desc    Mark the user/listener as "Present" when they enter the lobby page
// @route   POST /api/sessions/:sessionId/join
export const joinLobby = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id.toString(); // Authenticated user ID

    // Find the Session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // ecurity: Who is this person?
    const isUser = session.userId.toString() === userId;
    const isListener = session.listenerId?.toString() === userId;

    if (!isUser && !isListener) {
      return res.status(403).json({ message: "You are not authorized for this session" });
    }

    // The "Check-In" Logic (Idempotent)
    // We use a flag 'isUpdated' so we don't hit the DB if they refresh the page 10 times.
    let isUpdated = false;

    // A. If it's the USER and they haven't checked in yet
    if (isUser && !session.attendance.userJoinedAt) {
      session.attendance.userJoinedAt = new Date();
      session.attendance.userWasPresent = true;
      
      // Add to Timeline
      session.timeline.push({ 
        status: "ongoing", 
        time: new Date(), 
        note: "User joined the lobby" 
      });
      
      isUpdated = true;
    }

    // B. If it's the LISTENER and they haven't checked in yet
    if (isListener && !session.attendance.listenerJoinedAt) {
      session.attendance.listenerJoinedAt = new Date();
      session.attendance.listenerWasPresent = true;

      // Add to Timeline
      session.timeline.push({ 
        status: "ongoing", 
        time: new Date(), 
        note: "Listener joined the lobby" 
      });

      isUpdated = true;
    }

    // Save only if something changed
    if (isUpdated) {
      await session.save();
      console.log(`Attendance marked for Session ${sessionId} by User ${userId}`);
    }

    // Return Success (Even if they already joined, just say OK)
    res.status(200).json({ 
      success: true, 
      message: "Attendance recorded",
      role: isUser ? "user" : "listener"
    });

  } catch (error) {
    console.error("Join Lobby Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};