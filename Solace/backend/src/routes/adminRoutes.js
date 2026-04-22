import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { assignSession, getAdminMatchHistory, getAdminProfile, getListenersForAssignment, getPendingSessions } from "../controllers/adminController.js";

const router = express.Router();

router.get("/requests", protect,authorize("admin"),getPendingSessions);
router.get("/find-listeners/:sessionId",protect,authorize("admin","manager"),getListenersForAssignment);

router.put("/sessions/:id/assign", protect, authorize("admin","manager"), assignSession);
router.get('/history',protect, authorize("admin"), getAdminMatchHistory);

router.get('/profile', protect, authorize("admin"),getAdminProfile);
export default router
