import mongoose from "mongoose";
import Session from "../models/session.js";
import { debitWallet } from "../services/walletServices.js";
import { SESSION_PLANS } from "../config/sessionPlans.js";
import redis from "../lib/redis.js";
import listenerProfile from "../models/listenerProfile.js";

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

  /* ======================
     TIME TRAVEL & PROD CHECKS 
  ====================== */
  const now = new Date();

  // 1. Universal Check: Absolutely no booking in the past
  if (windowStart < now) {
    return { 
      success: false, 
      statusCode: 400, 
      message: "You cannot book a session in the past." 
    };
  }

  // 2. Production Check: Must book at least 12 hours in advance
  if (process.env.NODE_ENV === "production") {
    const hoursUntilSession = (windowStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilSession < 12) {
      return { 
        success: false, 
        statusCode: 400, 
        message: "Sessions must be booked at least 12 hours in advance." 
      };
    }
  }
  /* ====================== */

  // --- IST TIME LOGIC (Commented out but preserved) ---
  // const getISTHour = (date) => parseInt(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }), 10);
  // const startHourIST = getISTHour(windowStart);
  // const endHourIST = getISTHour(windowEnd);
  // if (startHourIST >= 0 && startHourIST < 8) { return { success: false, statusCode: 400, message: "Sessions cannot be booked between 12 AM and 8 AM IST." }; }
  // const dateString = dateOnly.toISOString().split('T')[0];
  // const startString = windowStart.toISOString().split('T')[0];
  // const endString = windowEnd.toISOString().split('T')[0];
  // if (startString !== dateString) { return { success: false, statusCode: 400, message: "Start time must be on the Scheduled Date." }; }
  // if (endString !== dateString) { return { success: false, statusCode: 400, message: "Session window cannot cross midnight (12 AM). Please finish before 11:59 PM." }; }
  // -------------------------------------------------------------

  // 3. Validate window logic (Duration & Midnight Rollover)
  
  // 🟢 NEW: If end time is "before" start time, assume it rolled over past midnight to the next day
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
  const selectedPlan = SESSION_PLANS[plan];
  if (!selectedPlan) {
    return { success: false, statusCode: 400, message: "Invalid session plan" };
  }

  const { duration, price } = selectedPlan;

  // 🟢 NEW: Calculate the Financial Split (80% Listener / 20% Solance)
  // We use subtraction for the platform fee to prevent floating-point rounding errors
  const listenerPayoutAmount = price * 0.80; 
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
        // 🟢 NEW: Save the exact payouts to the database forever
        listenerPayout: listenerPayoutAmount,
        platformFee: platformFeeAmount,
        timeline: [{
            status: "created",
            time: new Date(),
            note: "Session booked by user"
        }]
    }], { session });

    const newSession = created[0];

    // B. Debit wallet
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

// export const applyForSession = async (userId, data) => {
//   const { scheduledDate, preferredTimeStart, preferredTimeEnd, plan } = data;

//   // 1. Initial Validation
//   if (!scheduledDate || !preferredTimeStart || !preferredTimeEnd || !plan) {
//     return { success: false, statusCode: 400, message: "scheduledDate, preferredTimeStart, preferredTimeEnd and plan are required" };
//   }

//   // 2. Parse dates
//   const dateOnly = new Date(scheduledDate);
//   const windowStart = new Date(preferredTimeStart);
//   const windowEnd = new Date(preferredTimeEnd);

//   if (isNaN(dateOnly.getTime()) || isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
//     return { success: false, statusCode: 400, message: "Invalid date/time values" };
//   }

//   /* ======================
//      TIME TRAVEL & PROD CHECKS 
//   ====================== */
//   const now = new Date();

//   // 1. Universal Check: Absolutely no booking in the past
//   if (windowStart < now) {
//     return { 
//       success: false, 
//       statusCode: 400, 
//       message: "You cannot book a session in the past." 
//     };
//   }

//   // 2. Production Check: Must book at least 12 hours in advance
//   if (process.env.NODE_ENV === "production") {
//     const hoursUntilSession = (windowStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
//     if (hoursUntilSession < 12) {
//       return { 
//         success: false, 
//         statusCode: 400, 
//         message: "Sessions must be booked at least 12 hours in advance." 
//       };
//     }
//   }
//   /* ====================== */

//   // --- IST TIME LOGIC (Commented out but preserved) ---
//   // const getISTHour = (date) => parseInt(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }), 10);
//   // const startHourIST = getISTHour(windowStart);
//   // const endHourIST = getISTHour(windowEnd);
//   // if (startHourIST >= 0 && startHourIST < 8) { return { success: false, statusCode: 400, message: "Sessions cannot be booked between 12 AM and 8 AM IST." }; }
//   // const dateString = dateOnly.toISOString().split('T')[0];
//   // const startString = windowStart.toISOString().split('T')[0];
//   // const endString = windowEnd.toISOString().split('T')[0];
//   // if (startString !== dateString) { return { success: false, statusCode: 400, message: "Start time must be on the Scheduled Date." }; }
//   // if (endString !== dateString) { return { success: false, statusCode: 400, message: "Session window cannot cross midnight (12 AM). Please finish before 11:59 PM." }; }
//   // -------------------------------------------------------------

//   // 3. Validate window logic (Duration)
//   if (windowEnd <= windowStart) {
//     return { success: false, statusCode: 400, message: "preferredTimeEnd must be after preferredTimeStart" };
//   }

//   const windowMinutes = (windowEnd - windowStart) / (1000 * 60);
  
//   // Strict 2-3 Hour Window Check
//   if (windowMinutes < 120 || windowMinutes > 180) {
//     return { success: false, statusCode: 400, message: "Preferred time window must be between 2 to 3 hours." };
//   }

//   // 4. Validate plan
//   const selectedPlan = SESSION_PLANS[plan];
//   if (!selectedPlan) {
//     return { success: false, statusCode: 400, message: "Invalid session plan" };
//   }

//   const { duration, price } = selectedPlan;

//   // 5. TRANSACTION CORE
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // A. Create session request
//     const created = await Session.create([{
//         userId,
//         scheduledDate: dateOnly,
//         preferredTimeStart: windowStart,
//         preferredTimeEnd: windowEnd,
//         scheduledStartAt: null,
//         status: "pending",
//         bookedDurationMinutes: duration,
//         price,
//         timeline: [{
//             status: "created",
//             time: new Date(),
//             note: "Session booked by user"
//         }]
//     }], { session });

//     const newSession = created[0];

//     // B. Debit wallet
//     const result = await debitWallet({
//       userId,
//       amount: price,
//       referenceId: newSession._id,
//       reason: "SESSION",
//       session, 
//     });

//     // C. Handle Wallet Failures
//     if (!result.success) {
//       await session.abortTransaction();
//       session.endSession();

//       if (result.error === "WALLET_NOT_FOUND") {
//         return { success: false, statusCode: 400, message: "Please add money to your wallet first." };
//       }
//       if (result.error === "INSUFFICIENT_BALANCE") {
//         return { success: false, statusCode: 400, message: "Insufficient wallet balance." };
//       }
//       return { success: false, statusCode: 500, message: "Wallet transaction failed." };
//     }

//     // D. Commit
//     await session.commitTransaction();
//     session.endSession();

//     // E. Clear Caches
//     if (redis.status === 'ready') {
//       await redis.del(`dashboard:${userId}`);
//       await redis.del(`user:${userId}`);
//     }

//     // F. Return Success Data
//     return {
//       success: true,
//       statusCode: 201,
//       data: {
//         message: "Session request created successfully",
//         session: {
//           id: newSession._id,
//           status: newSession.status,
//           scheduledDate: newSession.scheduledDate,
//           preferredWindow: {
//             start: newSession.preferredTimeStart,
//             end: newSession.preferredTimeEnd,
//           },
//           duration: newSession.bookedDurationMinutes,
//           price: newSession.price,
//         }
//       }
//     };

//   } catch (err) {
//     if (session.inTransaction()) {
//        await session.abortTransaction();
//     }
//     session.endSession();
//     throw err;
//   }
// };