import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { applyForSession, canJoinSession, completeSession, getSessionDetails } from "../controllers/sessionController.js";
import { userKey } from "../middleware/ratelimitKeyMiddleware.js";
import { rateLimiter } from "../middleware/ratelimiterMiddleware.js";
import { getSessionHistory } from "../controllers/sessionController.js";
import { getMessages } from "../controllers/messageController.js";
// import { generateAgoraToken} from "../controllers/agoraController.js";
const router = express.Router();

router.post("/apply",protect,rateLimiter({
    windowSeconds: 80, // 1 day
    maxRequests: 4,
    keyGenerator: userKey("session-apply"),
  }),
  applyForSession);

router.get("/canJoin/:sessionId",protect,rateLimiter({
    windowSeconds: 60,
    maxRequests: 30,
    keyGenerator: userKey("can-join"),
  }),
  canJoinSession);


router.get("/history", protect, getSessionHistory);


router.get("/:sessionId/messages", protect, getMessages);

router.post("/complete", protect,  completeSession);

// Add this simple GET route
router.get("/:sessionId", protect, getSessionDetails);
export default router;