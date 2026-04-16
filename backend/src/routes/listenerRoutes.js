import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import { getListenerDashboard, toggleAvailability } from "../controllers/listenerDash.js";
import { getListenerSessions } from "../controllers/sessionController.js";
import { updateListenerProfile } from "../controllers/authController.js";
import { generatePresignedUrl } from "../controllers/uploadController.js";

const router = express.Router();


router.get("/dashboard", protect,getListenerDashboard);
router.put("/availability", protect,toggleAvailability);
router.get("/sessions", protect,getListenerSessions);

router.put("/update-profile", protect, updateListenerProfile);

router.post("/presigned-url", protect, generatePresignedUrl);
export default router;