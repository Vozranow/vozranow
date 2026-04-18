import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";
import Otp from "../models/otp.js";
import ListenerApplication from "../models/listenerApplication.js";
import ListenerProfile from "../models/listenerProfile.js";

import redis from "../lib/redis.js";
import * as authService from '../services/authService.js';

// Helper: Generate JWT
const generateAccessToken = (id) => {
  return jwt.sign({ id }, ENV.ACCESS_SECRET, {
    expiresIn: '300s', //5 min
  }); 
};
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, ENV.REFRESH_SECRET, {
    expiresIn: '7d', //7d
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// @desc registering new user into the db who are not verified but applied for signing up
//  @route  POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }
    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    // This block only runs if the database completely crashes. 
    // It returns the generic 500 error, NO raw code errors sent to frontend!
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc POST verifying the request sent by new users
export const verifyOtp = async (req, res) => {
  try {
    // 1. Send the data to the service
    const result = await authService.verifyOtp(req.body);

    // 2. If it failed (wrong OTP, expired, etc), return the exact error
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    // 3. Unpack the success data
    const { message, tokens, user } = result.data;

    // 4. Set the Access Token Cookie
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    // 5. Set the Refresh Token Cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6. Send the final success response!
    return res.status(result.statusCode).json({
      message,
      user
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc POST resending otp 
export const resendOtp = async (req, res) => {
  try {
    // 1. Pass the body to the service
    const result = await authService.resendOtp(req.body);

    // 2. Handle known failures (missing email, user not found, already verified)
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    // 3. Handle success
    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc POST logging in
export const loginUser = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    const { message, tokens, user } = result.data;

    // Set Access Token Cookie
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: "none"
      sameSite: "none", // Allows cross-origin/cross-scheme cookies
      maxAge: 5 * 60 * 1000, // 5 min
    });

    // Set Refresh Token Cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(result.statusCode).json({
      message,
      user,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// @desc getting user profile after user is authenticated GET
export const getProfile = async (req, res) => {
  try {
    // Pass the pre-loaded user object from your auth middleware straight to the service
    const result = await authService.getProfile(req.user);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// @desc when access toke expires frontend hits this  req POST
export const refreshAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    // 2. Verify refresh token
    const decoded = jwt.verify(   //checks if refresh token is valid and not expired
      refreshToken,
      ENV.REFRESH_SECRET
    );
    const newAccessToken = generateAccessToken(decoded.id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000, // 5 min
    });

    return res.status(200).json({
      message: "Access token refreshed",
    });

  } catch (error) {
    // Invalid / expired refresh token
    res.clearCookie("accessToken", { secure: true, sameSite: "none", httpOnly: true });
    res.clearCookie("refreshToken", { secure: true, sameSite: "none", httpOnly: true });
    console.log(error);
    return res.status(401).json({
      message: "Session expired. Please log in again.",  //if refresh token has expired itself then we do this.
    });
  }
};

// @desc logging out user and clearing cookies
// @desc POST logout user
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc POST forgot password (send reset link)
export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// @desc POST reset password using token
export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    // Service succeeded, user's password is changed. 
    // Now we force them to log in again by clearing their current session cookies.
    res.clearCookie("accessToken", { secure: true, sameSite: "none", httpOnly: true });
    res.clearCookie("refreshToken", { secure: true, sameSite: "none", httpOnly: true });

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc PATCH update profile (username / email)
export const updateProfile = async (req, res) => {
  try {
    // Pass both req.user AND req.body to the service
    const result = await authService.updateProfile(req.user, req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// @desc POST verify email change OTP
export const verifyEmailChangeOtp = async (req, res) => {
  try {
    const result = await authService.verifyEmailChangeOtp(req.user, req.body);

    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    console.error("Verify email change OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// @desc POST registering the listener
export const registerListener = async (req, res) => {
  try {
    // 1️⃣ Get Input (Token + Profile Details)
    // Note: We do NOT accept 'email' here. We steal it from the application.
    const { username, password, token, preferredDays } = req.body; 

    if (!token) return res.status(400).json({ message: "Invite token is required" });
    
    // Validate Availability Input (Optional but good)
    if (!preferredDays || !Array.isArray(preferredDays)) {
         return res.status(400).json({ message: "Please select your available days" });
    }

    // 2️⃣ Verify Token & Get Application
    const application = await ListenerApplication.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: Date.now() },
      status: "approved"
    }).select("+inviteToken");

    if (!application) {
      return res.status(400).json({ message: "Invalid or expired invite token" });
    }
    
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken. Please choose another." });
    }


    // 3️⃣ Create User (Locked to App Email)
    const newUser = await User.create({
      username,
      email: application.email, // 🔒 SECURITY: Use the vetted email
      password, // (Hashed by pre-save hook)
      role: "listener",
      emailVerified: true 
    });

    // 4️⃣ Create Profile (With Availability)
    await ListenerProfile.create({
      userId: newUser._id,
      isOnline: false, // Default to offline
      preferredDays: preferredDays, // 🗓️ e.g. ["Mon", "Wed", "Fri"]
      totalSessionsCompleted: 0
    });

    // 5️⃣ Cleanup Application (Prevent Reuse)
    application.status = "onboarded";
    application.inviteToken = undefined;
    application.inviteTokenExpires = undefined;
    await application.save();

    // 6️⃣ GENERATE TOKENS & SET COOKIES 🍪
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 7️⃣ Send Final Response
    res.status(201).json({
      message: "Registration successful! Welcome to the team.",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: "listener"
      }
    });

  } catch (error) {
    console.error("Listener Reg Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /api/listener/profile
export const updateListenerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio, preferredDays } = req.body; // e.g., ["Mon", "Wed"]

    const profile = await ListenerProfile.findOneAndUpdate(
      { userId },
      { bio, preferredDays },
      { new: true }
    );
    await redis.del(`dashboard:listener:${userId}`)
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};