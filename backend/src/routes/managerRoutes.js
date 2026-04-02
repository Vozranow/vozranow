import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { getPendingApplications, reviewApplication} from "../controllers/applicationController.js";
import { banListener, getFinancials, getListeners, getManagerDashboard, getSessionLogs, payListener} from "../controllers/managerController.js";

const router = express.Router();

router.get("/pending", protect,authorize("manager"),getPendingApplications);
router.put("/application/:id/review", protect,authorize("manager"),reviewApplication);

router.get('/metrics', protect , authorize("manager"), getManagerDashboard);

router.get("/financials", protect, authorize("manager"), getFinancials);
router.put("/payout/:listenerId", protect, authorize("manager"), payListener);

// Add to managerRoutes.js
router.get("/directory/listeners", protect, authorize( "manager"), getListeners);
router.put("/directory/listeners/:listenerId/ban", protect, authorize("manager"), banListener);


router.get("/sessions", protect, authorize( "manager"), getSessionLogs);
export default router;