import mongoose from "mongoose";

const listenerProfileSchema = new mongoose.Schema({
  // Link to the User Login (Auth)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One profile per user
  },

  // 🟢 The Toggle: Is he ready to take sessions?
  isOnline: {
    type: Boolean,
    default: false, 
  },

  // 🗓️ Availability: Which days does he work?
  // Admin uses this to filter listeners for a specific date
  preferredDays: [{
    type: String, 
    enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }],

  bio: {
    type: String,
    default: "",
    trim: true,
    maxLength: 500 // Good practice to prevent massive essays
  },

  // 🏷️ Tags for Admin to see (e.g., "Career Expert", "Fluent in Hindi")
  tags: [{
    type: String, 
  }],

  // ⭐ Ratings (For Sorting)
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 } 
  },

  // 📊 Dashboard Stats
  totalSessionsCompleted: {
    type: Number,
    default: 0
  },
  
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalPaidOut: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("ListenerProfile", listenerProfileSchema);