import User from "../models/users.js";
import Session from "../models/session.js";
import Session from "../models/session.js";
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

   
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. Get next upcoming session with name of listener
    const nextSession = await Session.findOne({
      userId,
      status: { $in: ["pending", "assigned"] },
      scheduledAt: { $gt: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .populate("listenerId", "username");

    return res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
      },
      walletBalance: user.walletBalance,
      totalSessions: user.totalSessions ,
      totalTimeSpent: user.totalTimeSpent ,
      nextSession,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};




export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const sessions = await Session.find({
      userId,
      status: "completed",
    })
      .sort({ endedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("listenerId", "username");

    const total = await Session.countDocuments({
      userId,
      status: "completed",
    });

    return res.status(200).json({
      sessions,
      page,
      totalPages: Math.ceil(total / limit),
      totalSessions: total,
    });
  } catch (error) {
    console.error("Session history error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
