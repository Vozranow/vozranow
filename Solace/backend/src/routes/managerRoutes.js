import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";

import { banListener, createPlatformAccount, getDisputedSessions, getEscalatedSessions, getFinancials, getListeners, getManagerDashboard, getSessionLogs, payListener, resolveDispute} from "../controllers/managerController.js";


const router = express.Router();

router.get('/metrics', protect , authorize("manager"), getManagerDashboard);

router.get("/financials", protect, authorize("manager"), getFinancials);
router.put("/payout/:listenerId", protect, authorize("manager"), payListener);

// Add to managerRoutes.js
router.get("/directory/listeners", protect, authorize( "manager"), getListeners);
router.put("/directory/listeners/:listenerId/ban", protect, authorize("manager"), banListener);


router.get("/sessions", protect, authorize( "manager"), getSessionLogs);

router.get(
  '/escalated', 
  protect, 
  authorize('manager'), // Only allow authorized staff
  getEscalatedSessions
);

router.get('/disputes', protect, authorize('manager'), getDisputedSessions);

router.put('/disputes/:sessionId/resolve', protect, authorize('manager'), resolveDispute);

router.post('/add-staff', protect, authorize('manager'), createPlatformAccount);

export default router;