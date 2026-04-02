import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getProfile,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logoutUser,
  updateProfile,
  verifyEmailChangeOtp,
  registerListener
  
} from "../controllers/authController.js";
import { otpVerifyLimiter } from "../middleware/otpVerifyLimiter.js";
import { otpResendLimiter } from "../middleware/otpResendLimiter.js";
import { protect } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/ratelimiterMiddleware.js";
import { emailKey, ipKey } from "../middleware/ratelimitKeyMiddleware.js";
const router = express.Router();

/* Public routes */
router.post("/register", registerUser);

router.post("/verify", otpVerifyLimiter("register"),verifyOtp);

router.post("/resend-otp", otpResendLimiter("register"), resendOtp); 

router.post("/login",rateLimiter({
    windowSeconds: 300, // 5 min
    maxRequests: 5,
    keyGenerator: ipKey("login"),
  }),loginUser); 


router.get("/getProfile",protect,getProfile);
router.post("/refresh",refreshAccessToken);
router.post("/forgot-pass",otpResendLimiter("register"),rateLimiter({
    windowSeconds: 600, // 10 min
    maxRequests: 3,
    keyGenerator: emailKey("forgot-password"),
  }),forgotPassword);

router.post("/reset-pass",resetPassword);
router.post("/logout",logoutUser);
router.put("/update-prof",protect,updateProfile);
router.post(
  "/verify-email-change",
  protect,
  otpVerifyLimiter("email_change", { fromAuth: true }),
  verifyEmailChangeOtp
);

router.post("/register-listener",registerListener);
export default router;