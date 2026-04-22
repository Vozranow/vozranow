// middleware/otpVerifyLimiter.js
import Otp from "../models/otp.js";

export const otpVerifyLimiter = (purpose, options = {}) => {
  return async (req, res, next) => {
    try {
      const email = options.fromAuth
        ? req.user?.email
        : req.body.email;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const otpRecord = await Otp.findOne({ email, purpose });
      if (!otpRecord) {
        return res.status(400).json({ message: "OTP not found or expired" });
      }

      if (otpRecord.lockedUntil && otpRecord.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil(
          (otpRecord.lockedUntil - Date.now()) / (60 * 1000)
        );

        return res.status(429).json({
          message: `Too many attempts. Try again in ${remainingMinutes} minutes.`,
        });
      }

      next();
    } catch (error) {
      console.error("OTP verify limiter error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
