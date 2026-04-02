import Session from "../models/session.js";
import ListenerProfile from "../models/listenerProfile.js";
import User from "../models/users.js";
import redis from "../lib/redis.js"; 
import mongoose from "mongoose";
import * as listenerService from '../services/listenerDashServices.js';
// @desc    Get Listener Dashboard (Stats, Availability, Earnings)
// @route   GET /api/listener/dashboard
export const getListenerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await listenerService.getDashboardData(userId);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Listener Dashboard Error:", error);
    next(error);
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
   await redis.del(`dashboard:listener:${userId}`);
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
// @route   PUT /api/listener/update-prof
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 1. Extract both preferredDays and bio from the incoming request
    const { preferredDays, bio } = req.body; 

    // 2. Update the profile with both fields
    const profile = await ListenerProfile.findOneAndUpdate(
      { userId },
      { 
        preferredDays, 
        bio // 🟢 Added bio to the update payload
      }, 
      { new: true }
    );

    // Safety check in case the profile somehow doesn't exist
    if (!profile) {
      return res.status(404).json({ message: "Listener profile not found." });
    }
    
    // 3. Invalidate the Redis cache so the dashboard instantly shows the new data
    if (typeof redis !== 'undefined' && redis.status === 'ready') {
      await redis.del(`dashboard:listener:${userId}`);
    }

    // 4. Return success with the fresh data
    res.status(200).json({ 
      message: "Profile settings updated successfully", 
      preferredDays: profile.preferredDays,
      bio: profile.bio
    });

  } catch (error) {
    console.error("Update Listener Settings Error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};