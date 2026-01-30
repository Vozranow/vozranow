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
  verifyEmailChangeOtp
  
} from "../controllers/authController.js";
import { otpVerifyLimiter } from "../middleware/otpVerifyLimiter.js";
import { otpResendLimiter } from "../middleware/otpResendLimiter.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

/* Public routes */
router.post("/register", registerUser);
router.post("/verify", otpVerifyLimiter("register"),verifyOtp);
router.post("/resend-otp", otpResendLimiter, resendOtp);
router.post("/login",loginUser);
router.get("/getProfile",protect,getProfile);
router.post("/refresh",refreshAccessToken);
router.post("/forgot-pass",otpResendLimiter("register"),forgotPassword);
router.post("/reset-pass",resetPassword);
router.post("/logout",logoutUser);
router.put("/update-prof",protect,updateProfile);
router.post(
  "/verify-email-change",
  protect,
  otpVerifyLimiter("email_change", { fromAuth: true }),
  verifyEmailChangeOtp
);
export default router;