import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { getPendingApplications, reviewApplication} from "../controllers/applicationController.js";

const router = express.Router();

router.get("/pending", protect,authorize("manager"),getPendingApplications);
router.put("/application/:id/review", protect,authorize("manager"),reviewApplication)

export default router;