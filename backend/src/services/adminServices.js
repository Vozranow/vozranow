import Session from '../models/session.js';
import User from '../models/users.js';
export const getMatchHistoryData = async (adminId, page = 1, limit = 10) => {
  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  // Run the find query and the count query simultaneously for speed
  const queryFilter = { 
    assignedBy: adminId, 
    status: { $in: ["assigned", "ongoing", "completed", "cancelled"] } 
  };

  const [sessions, totalCount] = await Promise.all([
    Session.find(queryFilter)
      .populate("userId", "username email")
      .populate("listenerId", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)   // 👈 Skip previous pages
      .limit(limit), // 👈 Limit to current page size
      
    Session.countDocuments(queryFilter)
  ]);

  const formattedHistory = sessions.map(session => ({
    _id: session._id,
    clientName: session.userId?.username || "Unknown User",
    clientEmail: session.userId?.email || "N/A",
    listenerName: session.listenerId?.username || "Unknown Listener",
    scheduledDate: session.scheduledDate,
    scheduledStartAt: session.scheduledStartAt, 
    duration: session.bookedDurationMinutes,
    status: session.status,
    assignedAt: session.updatedAt 
  }));

  // Determine if there are more items to fetch
  const hasMore = skip + sessions.length < totalCount;

  return {
    success: true,
    statusCode: 200,
    data: {
      history: formattedHistory,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore
    }
  };
};

export const getAdminProfileData = async (adminId) => {
  // 1. Fetch Admin User details (Strictly EXCLUDE the password hash)
  const adminDoc = await User.findById(adminId).select("-password");

  if (!adminDoc) {
    return { success: false, statusCode: 404, message: "Admin profile not found" };
  }

  // 2. Bonus: Calculate how many sessions this specific admin has assigned
  const totalAssigned = await Session.countDocuments({ assignedBy: adminId });

  // 3. Format the response to fulfill your exact requirements
  const profileData = {
    _id: adminDoc._id,
    name: adminDoc.username,
    email: adminDoc.email,
    role: adminDoc.role,
    stats: {
      totalAssignedSessions: totalAssigned
    },
    // A clean UI note so the admin knows why they can't change their password
    securityNote: "Account credentials are managed by your System Administrator." 
  };

  return {
    success: true,
    statusCode: 200,
    data: profileData
  };
};