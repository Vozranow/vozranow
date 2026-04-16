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


// @desc    Get all disputed sessions for Manager Dashboard
// @route   GET /api/manager/disputes
export const getDisputedSessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await managerService.getDisputedSessionsService(page, limit);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Manager Fetch Disputes Error:", error);
    next(error);
  }
};

// @desc    Approve or Reject a Dispute (Refund or Deny)
// @route   PUT /api/manager/disputes/:sessionId/resolve
export const resolveDispute = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { action, managerNote } = req.body;
    const managerId = req.user._id; 

    const result = await managerService.resolveDisputeService(
      sessionId, 
      action, 
      managerNote, 
      managerId
    );

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json({
      message: result.message,
      session: result.data
    });

  } catch (error) {
    console.error("Manager Resolve Dispute Error:", error);
    next(error);
  }
};

export const createPlatformAccount = async (req, res, next) => {
  try {
    const { username, email, password, role, tags, preferredDays } = req.body;
    
    // Group it neatly for the service
    const accountData = {
      username,
      email,
      password,
      role,
      tags,
      preferredDays
    };

    const result = await managerService.createPlatformAccountService(accountData);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error("Manager Create Platform Account Error:", error);
    next(error);
  }
};