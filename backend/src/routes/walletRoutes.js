import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder,  getWalletHistory, verifyPayment } from "../controllers/walletController.js";  //creditWallet,
import { userKey } from "../middleware/ratelimitKeyMiddleware.js";
import { rateLimiter } from "../middleware/ratelimiterMiddleware.js";
const router = express.Router();

// router.post(
//   "/credit",
//   protect,
//   rateLimiter({
//     windowSeconds: 36, // 1 hour
//     maxRequests: 5,
//     keyGenerator: userKey("wallet-credit")}),
//   creditWallet
// );

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/history", protect, getWalletHistory);


export default router;