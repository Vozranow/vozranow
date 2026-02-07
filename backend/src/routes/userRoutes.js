import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserDashboard } from "../controllers/dashboardController.js";
import { rateLimiter } from "../middleware/ratelimiterMiddleware.js";
import { userKey } from "../middleware/ratelimitKeyMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  rateLimiter({
    windowSeconds: 300, // 5 minutes
    maxRequests: 30,    // 30 requests per 5 min per user
    keyGenerator: userKey("dashboard"),
  }),
  getUserDashboard
);


export default router;