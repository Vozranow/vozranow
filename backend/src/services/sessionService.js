import mongoose from "mongoose";
import Session from "../models/session.js";
import { debitWallet } from "../services/walletServices.js";
import { SESSION_PLANS } from "../config/sessionPlans.js";
import User from "../models/users.js";
import redis from "../lib/redis.js";


export const applyForSession = async (userId, data) => {
  const { scheduledDate, preferredTimeStart, preferredTimeEnd, plan } = data;

  // 1. Initial Validation
  if (!scheduledDate || !preferredTimeStart || !preferredTimeEnd || !plan) {
    return { success: false, statusCode: 400, message: "scheduledDate, preferredTimeStart, preferredTimeEnd and plan are required" };
  }

  // 2. Parse dates
  const dateOnly = new Date(scheduledDate);
  const windowStart = new Date(preferredTimeStart);
  const windowEnd = new Date(preferredTimeEnd);

  if (isNaN(dateOnly.getTime()) || isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
    return { success: false, statusCode: 400, message: "Invalid date/time values" };
  }

  
  const now = new Date();

  // 1. Universal Check: Absolutely no booking in the past
  if (windowStart < now) {
    return { 
      success: false, 
      statusCode: 400, 
      message: "You cannot book a session in the past." 
    };
  }

  // 2. Production Check: Must book at least 6 hours in advance
  const sixHoursInMs = 6 * 60 * 60 * 1000;
  if (windowStart.getTime() - now.getTime() < sixHoursInMs) {
    return { 
      success: false, 
      statusCode: 400, 
      message: "Sessions must be booked at least 6 hours in advance." 
    };
  }

  // 3. Validate window logic (Duration & Midnight Rollover)
  
  //  If end time is "before" start time, assume it rolled over past midnight to the next day
  if (windowEnd <= windowStart) {
    windowEnd.setDate(windowEnd.getDate() + 1);
  }

  const windowMinutes = (windowEnd - windowStart) / (1000 * 60);
  
  // Strict 2-3 Hour Window Check
  if (windowMinutes < 120 || windowMinutes > 180) {
    return { 
      success: false, 
      statusCode: 400, 
      message: "Preferred time window must be between 2 to 3 hours." 
    };
  }

  // 4. Validate plan
  // 4. Validate plan
  const selectedPlan = SESSION_PLANS[plan];
  if (!selectedPlan) {
    return { success: false, statusCode: 400, message: "Invalid session plan" };
  }

  const { duration, price } = selectedPlan;

  // FREE TRIAL LOCK
  if (duration === 5 && price === 0) {
    const user = await User.findById(userId);
    if (user.hasUsedFreeTrial) {
      return { 
        success: false, 
        statusCode: 403, 
        message: "You have already used your free 5-minute trial. Please select a paid plan." 
      };
    }
  }

  // Calculate the Financial Split (80% Listener / 20% Vozranow)
  const listenerPayoutAmount = price * 0.20; 
  const platformFeeAmount = price - listenerPayoutAmount; 

  // 5. TRANSACTION CORE
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // A. Create session request
    const created = await Session.create([{
        userId,
        scheduledDate: dateOnly,
        preferredTimeStart: windowStart,
        preferredTimeEnd: windowEnd,
        scheduledStartAt: null,
        status: "pending",
        bookedDurationMinutes: duration,
        price,
        listenerPayout: listenerPayoutAmount,
        platformFee: platformFeeAmount,
        timeline: [{
            status: "created",
            time: new Date(),
            note: "Session booked by user"
        }]
    }], { session });

    const newSession = created[0];

    // B. Debit wallet (if price is greater than 0)
    if (price > 0) {
      const result = await debitWallet({
        userId,
        amount: price,
        referenceId: newSession._id,
        reason: "SESSION",
        session, 
      });

      // C. Handle Wallet Failures
      if (!result.success) {
        await session.abortTransaction();
        session.endSession();

        if (result.error === "WALLET_NOT_FOUND") {
          return { success: false, statusCode: 400, message: "Please add money to your wallet first." };
        }
        if (result.error === "INSUFFICIENT_BALANCE") {
          return { success: false, statusCode: 400, message: "Insufficient wallet balance." };
        }
        return { success: false, statusCode: 500, message: "Wallet transaction failed." };
      }
    }

  

    // D. Commit
    await session.commitTransaction();
    session.endSession();

    // E. Clear Caches
    if (typeof redis !== 'undefined' && redis.status === 'ready') {
      await redis.del(`dashboard:${userId}`);
      await redis.del(`user:${userId}`);
    }

    // F. Return Success Data
    return {
      success: true,
      statusCode: 201,
      data: {
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
          price: newSession.price, // Frontend still only sees the total price paid
        }
      }
    };

  } catch (err) {
    if (session.inTransaction()) {
       await session.abortTransaction();
    }
    session.endSession();
    throw err;
  }
};


