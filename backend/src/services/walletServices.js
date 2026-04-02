import mongoose from "mongoose";
import Wallet from "../models/wallet.js";
import WalletTransaction from "../models/walletTransaction.js";
import User from "../models/users.js";
import redis from "../lib/redis.js";
import Razorpay from "razorpay";
import { ENV } from "../lib/env.js";
const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});
import crypto from "crypto"


export const createOrder = async (userId, amount) => {
  if (!amount || amount <= 0) {
    return { success: false, statusCode: 400, message: "Invalid amount" };
  }

  const options = {
    amount: amount * 100, // Paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}_${userId.toString().slice(-4)}`,
  };

  const order = await razorpay.orders.create(options);

  return { success: true, statusCode: 200, data: { order } };
};

export const verifyAndCreditWallet = async (userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  // 1. VERIFY SIGNATURE (Fast fail outside transaction)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return { success: false, statusCode: 400, message: "Invalid Payment Signature" };
  }

  // 2. START ACID TRANSACTION
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // A. IDEMPOTENCY CHECK: Has this exact payment ID already been processed? (DOUBLE SPEND PROTECTION)
    const existingTx = await WalletTransaction.findOne({ referenceId: razorpay_payment_id }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      // Return 200 anyway so the frontend thinks it succeeded, but we don't credit them twice!
      return { success: true, statusCode: 200, data: { message: "Payment already processed" } }; 
    }

    // B. Fetch verified amount from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order) throw new Error("Razorpay order not found");
    
    const amountInRupees = order.amount / 100;

    // C. Find or Create Wallet
    let wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) {
      const newWallets = await Wallet.create([{
        userId,
        balance: 0,
        currency: "INR"
      }], { session });
      wallet = newWallets[0];
    }

    // D. Calculate & Update
    const newBalance = wallet.balance + amountInRupees;
    wallet.balance = newBalance;
    await wallet.save({ session });

    // E. Update User Cache 
    await User.updateOne({ _id: userId }, { walletBalance: newBalance }, { session });

    // F. Create Ledger Entry
    await WalletTransaction.create([{
      userId,
      type: "TOPUP",
      amount: amountInRupees,
      balanceAfter: newBalance,
      referenceId: razorpay_payment_id,
      status: "success"
    }], { session });

    // G. COMMIT
    await session.commitTransaction();
    session.endSession();

    // H. Clear Caches after successful commit
    if (redis.status === 'ready') {
      await redis.del(`dashboard:${userId}`);
      await redis.del(`user:${userId}`);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        success: true,
        message: `Successfully added ₹${amountInRupees}`,
        balance: newBalance,
      }
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error; // Let controller catch it
  }
};

// @desc for debiting money from wallet and having ACID 
export const debitWallet = async ({
  userId,
  amount,
  referenceId = null,
  reason = "SESSION",
  session,
}) => {
  // basic validation (developer error, not user error)
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Invalid debit amount");
  }

  if (!session) {
    throw new Error("Mongo session is required");
  }

  const wallet = await Wallet.findOne({ userId }).session(session);
  // console.log(wallet);

  // ❗ business-rule failure → return status, DO NOT throw
  if (!wallet) {
    return {
      success: false,
      error: "WALLET_NOT_FOUND",
    };
  }

  // ❗ business-rule failure → return status, DO NOT throw
  if (wallet.balance < amount) {
    return {
      success: false,
      error: "INSUFFICIENT_BALANCE",
    };
  }

  const newBalance = wallet.balance - amount;

  // update wallet
  wallet.balance = newBalance;
  await wallet.save({ session });

  // update cached balance
  await User.updateOne(
    { _id: userId },
    { walletBalance: newBalance },
    { session }
  );
  await redis.del(`dashboard:${userId}`);

  await redis.del(`user:${userId}`);
  // ledger entry
  await WalletTransaction.create(
    [
      {
        userId,
        type: reason,
        amount,
        balanceAfter: newBalance,
        referenceId,
        status: "success",
      },
    ],
    { session }
  );

  return {
    success: true,
    balance: newBalance,
  };
};


// 📊 HISTORY SERVICE
export const getWalletHistory = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { userId };

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const total = await WalletTransaction.countDocuments(query);

    return {
      success: true,
      statusCode: 200,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
        }
      }
    };
  } catch (error) {
    throw error;
  }
};