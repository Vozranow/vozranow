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
/**
 * Fake wallet top-up (used now, Razorpay later)
 * POST /api/wallet/topup
 */
// export const creditWallet = async (req, res, next) => {
//   const { amount } = req.body;
//   const userId = req.user._id;


//   if (!amount || typeof amount !== "number" || amount <= 0) {
//     return res.status(400).json({
//       message: "Invalid top-up amount",
//     });
//   }

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     let wallet = await Wallet.findOne({ userId }).session(session);

//     if (!wallet) {   //that means first transction
//       wallet = await Wallet.create(
//         [
//           {
//             userId,
//             balance: 0,
//             currency: "INR",
//           },
//         ],
//         { session }
//       );

//       wallet = wallet[0];
//     }

//     // 3️⃣ Calculate new balance
//     const newBalance = wallet.balance + amount;

//     // 4️⃣ Update wallet balance
//     wallet.balance = newBalance;
//     await wallet.save({ session });

//     // 5️⃣ Update User wallet cache
//     await User.updateOne(
//       { _id: userId },
//       { walletBalance: newBalance },
//       { session }
//     );

//     // 6️⃣ Create wallet transaction (ledger)
//     await WalletTransaction.create(
//       [
//         {
//           userId,
//           type: "TOPUP",
//           amount: amount, // always positive
//           balanceAfter: newBalance,
//           status: "success",
//         },
//       ],
//       { session }
//     );
//     // This forces the dashboard to fetch the new balance immediately
//     await redis.del(`dashboard:${userId}`);

//     // 7️⃣ Commit ACID transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       message: "Wallet credited successfully",
//       balance: newBalance,
//     });
//   } catch (error) {
//     // Rollback everything
//     await session.abortTransaction();
//     session.endSession();

//     next(error);
//   }
// };

//




// 1. CREATE ORDER
// Frontend sends amount -> We ask Razorpay for an Order ID
// ----------------------------------------------------------------------
export const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // Amount in Rupees (e.g. 500)

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Razorpay works in "Paise" (100 paise = 1 Rupee)
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order, // Sends { id: "order_123...", amount: 50000, ... }
    });

  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    next(error);
  }
};


export const verifyPayment = async (req, res, next) => {
  // 1. VERIFY SIGNATURE (Do this FIRST, outside the transaction)
  // If this fails, we don't want to waste database resources opening a session.
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user._id;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
  }

  // 2. START ACID TRANSACTION
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // A. Fetch verified amount from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order) throw new Error("Razorpay order not found");
    
    const amountInRupees = order.amount / 100;

    // B. Find or Create Wallet (with session)
    let wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) {
      const newWallets = await Wallet.create([{
        userId,
        balance: 0,
        currency: "INR"
      }], { session });
      wallet = newWallets[0];
    }

    // C. Calculate New Balance
    const newBalance = wallet.balance + amountInRupees;

    // D. Update Wallet
    wallet.balance = newBalance;
    await wallet.save({ session });

    // E. Update User Cache (Denormalized field)
    await User.updateOne(
      { _id: userId },
      { walletBalance: newBalance },
      { session }
    );

    // F. Create Ledger Entry (Transaction)
    await WalletTransaction.create([{
      userId,
      type: "TOPUP",
      amount: amountInRupees,
      balanceAfter: newBalance,
      referenceId: razorpay_payment_id, // Important: Link to Razorpay ID
      status: "success"
    }], { session });

    // G. Clear Redis Cache (So dashboard updates instantly)
    // Note: We do this *before* commit, or right after. 
    // If we do it here and commit fails, the cache clears but old data reloads. That's fine.
    await redis.del(`dashboard:${userId}`);

    await redis.del(`user:${userId}`);

    // H. COMMIT
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Successfully added ₹${amountInRupees}`,
      balance: newBalance,
    });

  } catch (error) {
    // I. ROLLBACK ON FAILURE
    await session.abortTransaction();
    session.endSession();
    
    console.error("Payment Verification Failed:", error);
    next(error);
  }
};


// @desc when paying for session , money debits from balance. not a controller func , only a session helper.
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


// @desc    Get full wallet transaction history with pagination
// @route   GET /api/wallet/history?page=1&limit=20
export const getWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId };

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const total = await WalletTransaction.countDocuments(query);

    res.status(200).json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
      }
    });

  } catch (error) {
    console.error("Wallet History Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

