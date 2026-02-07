import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { submitApplication } from "../controllers/applicationController.js";
import { getListenerDashboard, toggleAvailability } from "../controllers/listenerDash.js";

const router = express.Router();

router.post("/apply", submitApplication);
router.get("/dashboard", protect,getListenerDashboard);
router.put("/availability", protect,toggleAvailability);
export default router;