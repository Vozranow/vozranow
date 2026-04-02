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
      ref: "User",
      default: null,
    },

    // CHANGED: Renamed from 'adminId' for clarity
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The Admin who clicked the button
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "ongoing", "completed", "cancelled", "escalated"],
      default: "pending",
    },

    // NEW: Controls the "Join Lobby" button visibility
    isLobbyOpen: {
      type: Boolean,
      default: false, 
    },

    // Fixed calendar date chosen by user
    scheduledDate: {
      type: Date,
      required: true,
    },

    // Flexible time window on that date
    preferredTimeStart: {
      type: Date,
      required: true,
    },

    preferredTimeEnd: {
      type: Date,
      required: true,
    },

    // Final committed start time (set later)
    scheduledStartAt: {
      type: Date,
      default: null,
    },

    // What user paid for
    bookedDurationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    // Actual session timing
    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    actualDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    listenerPayout: { 
      type: Number, 
      default: 0 
    },
    platformFee: { 
      type: Number, 
      default: 0 
    },
    payoutStatus: { 
      type: String, 
      enum: ['pending', 'paid'], 
      default: 'pending' 
    },
    meetLink: {
      type: String,
      default: "", 
    },

    // The saved video file (After session)
    recordingUrl: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    // NEW: Feedback system
    review: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: "" },
      createdAt: { type: Date }
    },

    // NEW: Track status changes for the dashboard UI
    timeline: [
      {
        status: { type: String, enum: ["created", "assigned", "started", "completed", "cancelled" , "escalated"] },
        time: { type: Date, default: Date.now },
        note: String // e.g., "Assigned by Admin John"
      }
    ],
    attendance: {
      userJoinedAt: { type: Date, default: null },
      listenerJoinedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Indexes
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, status: 1, scheduledStartAt: 1 });
// New Index: Helps Admin find sessions needing assignment quickly
sessionSchema.index({ status: 1, scheduledDate: 1 }); 

// Sanity checks
sessionSchema.pre("save", function (next) {
  if (this.startedAt && this.endedAt && this.endedAt < this.startedAt) {
    return next(new Error("endedAt cannot be before startedAt"));
  }

  if (
    this.preferredTimeStart &&
    this.preferredTimeEnd &&
    this.preferredTimeEnd <= this.preferredTimeStart
  ) {
    return next(
      new Error("preferredTimeEnd must be after preferredTimeStart")
    );
  }

  next();
});

export default mongoose.model("Session", sessionSchema);