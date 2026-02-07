import Session from "../models/session.js";
import ListenerProfile from "../models/listenerProfile.js";
import User from "../models/users.js";

// @desc    Get Listener Dashboard (Stats, Availability, Earnings)
// @route   GET /api/listener/dashboard
export const getListenerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Fetch Profile & Basic Stats
    const profile = await ListenerProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Listener profile not found" });

    // 2️⃣ Fetch Upcoming Sessions (Sorted by nearest)
    const upcomingSessions = await Session.find({
      listenerId: userId,
      status: { $in: ["assigned", "ongoing"] },
      scheduledDate: { $gte: new Date() }
    })
    .sort({ scheduledDate: 1 })
    .populate("userId", "username"); // Show who the client is

    // 3️⃣ CALCULATE MONTHLY STATS (The Earnings Panel) 🧮
    // We use Aggregation to sum up sessions for *THIS MONTH ONLY*
    const startOfMonth = new Date();
    startOfMonth.setDate(1); 
    startOfMonth.setHours(0,0,0,0);

    const monthlyStats = await Session.aggregate([
      {
        $match: {
          listenerId: userId,
          status: "completed",
          createdAt: { $gte: startOfMonth } // Only this month
        }
      },
      {
        $group: {
          _id: null,
          sessionsThisMonth: { $sum: 1 },
          earnedThisMonth: { $sum: "$price" }, // Sum the price of sessions
          hoursThisMonth: { $sum: "$actualDurationMinutes" }
        }
      }
    ]);

    const currentMonth = monthlyStats[0] || { 
      sessionsThisMonth: 0, 
      earnedThisMonth: 0, 
      hoursThisMonth: 0 
    };

    // 4️⃣ Response Construction
    res.status(200).json({
      overview: {
        totalSessions: profile.totalSessionsCompleted,
        totalHours: Math.round(profile.totalSessionsCompleted * 1), // Assuming 1hr avg if not tracked perfectly
        totalEarnings: profile.totalEarnings, // All time
        rating: profile.rating.average.toFixed(1)
      },
      monthlyEarnings: {
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        sessions: currentMonth.sessionsThisMonth,
        earnings: currentMonth.earnedThisMonth,
        hours: (currentMonth.hoursThisMonth / 60).toFixed(1) // Convert mins to hours
      },
      availability: {
        isOnline: profile.isOnline,
        preferredDays: profile.preferredDays
      },
      upcomingSessions // Frontend handles "In 2 days" logic
    });

  } catch (error) {
    console.error("Listener Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Toggle Availability (Online/Offline)
// @route   PUT /api/listener/availability
export const toggleAvailability = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isOnline } = req.body; // true or false

    const profile = await ListenerProfile.findOneAndUpdate(
      { userId },
      { isOnline },
      { new: true }
    );

    res.status(200).json({ 
      message: isOnline ? "You are now Online" : "You are now Offline", 
      isOnline: profile.isOnline 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update Preferred Days
// @route   PUT /api/listener/settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferredDays } = req.body; // e.g., ["Mon", "Wed"]

    const profile = await ListenerProfile.findOneAndUpdate(
      { userId },
      { preferredDays },
      { new: true }
    );

    res.status(200).json({ 
      message: "Settings updated", 
      preferredDays: profile.preferredDays 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};