import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // extra safety at DB level
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
