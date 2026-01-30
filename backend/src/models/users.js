import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: true,
      select: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Privacy control
    privacyMode: {
      type: String,
      enum: ["anonymous", "identified"],
      default: "anonymous",
    },

    // Wallet
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Roles
    role: {
      type: String,
      enum: ["user", "listener", "admin", "super_admin", "founder"],
      default: "user",
    },

    // Security & control
    isBlocked: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
    },

    totalSessions: {
      type: Number,
      default: 0,
      min: 0,
    }, // count (optional but useful)
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


// Hashing password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
