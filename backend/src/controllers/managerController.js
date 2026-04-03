import * as managerService from '../services/managerServices.js';

// @desc    Get God-Mode Dashboard Stats
// @route   GET /api/manager/metrics
export const getManagerDashboard = async (req, res, next) => {
  try {
    const result = await managerService.getDashboardMetrics();

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Manager Dashboard Error:", error);
    next(error);
  }
};

// Add to manager.controller.js
export const getFinancials = async (req, res, next) => {
  try {
    // Default to current month/year if not provided in query
    const targetMonth = parseInt(req.query.month) || new Date().getMonth() + 1;
    const targetYear = parseInt(req.query.year) || new Date().getFullYear();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await managerService.getFinancialLedger(targetMonth, targetYear, page, limit);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Manager Financials Error:", error);
    next(error);
  }
};

export const payListener = async (req, res, next) => {
  try {
    const { listenerId } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required to process a payout safely." });
    }

    const result = await managerService.processListenerPayout(listenerId, month, year);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json({ message: result.message });

  } catch (error) {
    console.error("Process Payout Error:", error);
    next(error);
  }
};


// Add these to manager.controller.js
export const getListeners = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await managerService.getListenerDirectory(page, limit);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const banListener = async (req, res, next) => {
  try {
    const { listenerId } = req.params;
    const result = await managerService.banListenerAccount(listenerId);
    
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }
    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    next(error);
  }
};


export const getSessionLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const search = req.query.search || ""; // 🟢 Grab the search text

    const result = await managerService.getPlatformSessionLogs(page, limit, search);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getEscalatedSessions = async (req, res) => {
  try {
    // Call the service to do the heavy lifting database queries
    const result = await managerService.getEscalatedSessionsService();
    
    // Send back the standardized response object exactly as the frontend expects
    res.status(result.statusCode).json(result.data);
    
  } catch (error) {
    console.error("Fetch Escalated Controller Error:", error);
    res.status(500).json({ message: "Failed to fetch escalated sessions" });
  }
};