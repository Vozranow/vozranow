import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    listenerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // role = listener
      default: null,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who assigned
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "ongoing", "completed", "cancelled"],
      default: "pending",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number, // amount deducted from wallet
      required: true,
    },

    recordingUrl: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
