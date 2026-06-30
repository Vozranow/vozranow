// middleware/otpResendLimiter.js
import Otp from "../models/otp.js";

export const otpResendLimiter = (purpose, options = {}) => {
  return async (req, res, next) => {
    try {
      const email = options.fromAuth
        ? req.user?.email
        : req.body.email;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const otpRecord = await Otp.findOne({ email, purpose });
      if (!otpRecord) return next();

      const secondsSinceLastOtp =
        (Date.now() - otpRecord.createdAt.getTime()) / 1000;

      if (secondsSinceLastOtp < 60) {
        return res.status(429).json({
          message: "Please wait before requesting another OTP",
        });
      }

      next();
    } catch (error) {
      console.error("OTP resend limiter error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
