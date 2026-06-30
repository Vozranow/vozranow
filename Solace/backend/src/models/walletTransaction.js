import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["TOPUP", "SESSION", "REFUND"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0, // NEVER negative
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    referenceId: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

// Important index for wallet history
walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);
