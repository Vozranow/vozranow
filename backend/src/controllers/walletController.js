
import * as walletService from '../services/walletServices.js';
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
    const result = await walletService.createOrder(req.user._id, req.body.amount);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    next(error);
  }
};


export const verifyPayment = async (req, res, next) => {
  try {
    const result = await walletService.verifyAndCreditWallet(req.user._id, req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    console.error("Payment Verification Failed:", error);
    next(error);
  }
};





// @desc    Get full wallet transaction history with pagination
// @route   GET /api/wallet/history?page=1&limit=20
export const getWalletHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await walletService.getWalletHistory(userId, page, limit);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Wallet History Error:", error);
    next(error); // Passes to your global error handler
  }
};

