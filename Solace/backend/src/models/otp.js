import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["register", "email_change", "password_reset"],
      required: true,
      index: true,
    },

    meta: {
      type: Object,
      default: {},
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
    },

    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
