import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true, // ⚡ Index for fast retrieval
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "system", "link"], // 'link' is for the meet url
      default: "text",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Useful for showing "read" status later if needed
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] 
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);