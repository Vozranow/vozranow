import mongoose from "mongoose";

const listenerApplicationSchema = new mongoose.Schema({
  // ... basic info ...
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  answers: {
    experience: String,
    reason: String,
    language: String,
    availableHours: String,
  },
  
  // 🟢 FIX 1: Add "onboarded" here
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "onboarded"], 
    default: "pending",
  },

  rejectedAt: { type: Date },

  // 🟢 FIX 2: Ensure these can be cleared (Not required fields)
  inviteToken: { type: String, select: false }, 
  inviteTokenExpires: Date,

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejectionReason: String 

}, { timestamps: true });

// Auto-delete 7 days after 'rejectedAt' is set
listenerApplicationSchema.index({ rejectedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.model("ListenerApplication", listenerApplicationSchema);