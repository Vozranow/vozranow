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
      enum: ["topup", "session_deduction", "refund"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      // positive = credit, negative = debit
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // sessionId or paymentId
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);
