import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { assignSession, getListenersForAssignment, getPendingSessions } from "../controllers/adminController.js";

const router = express.Router();

router.get("/requests", protect,authorize("admin"),getPendingSessions);
router.get("/find-listeners/:sessionId",protect,authorize("admin"),getListenersForAssignment);

router.put("/sessions/:id/assign", protect, authorize("admin"), assignSession);
export default router
