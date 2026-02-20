import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";
import Otp from "../models/otp.js";
import ListenerApplication from "../models/listenerApplication.js";
import ListenerProfile from "../models/listenerProfile.js";
import { sendForgotEmail, sendOtpEmail } from "../lib/sendMail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import redis from "../lib/redis.js";
import { AppError } from '../lib/appError.js';

//**************helper fucn************ */
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
//************************************* */


export const registerUser = async ({ username, email, password }) => {
  // Initial Validation
  if (!username || !email || !password) {
    throw new AppError(400, "Username, email and password are required");
  }

  try {
    // 1. Check if ANY user exists with this email (verified or not)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // CASE A: User is already verified. Stop them.
      if (existingUser.emailVerified) {
        throw new AppError(400, "Email already registered");
      }

      // CASE B: User exists but is UNVERIFIED (The "Come back next day" case)
      const usernameTaken = await User.findOne({ 
        username, 
        _id: { $ne: existingUser._id } 
      });
      
      if (usernameTaken) {
        throw new AppError(400, "Username already taken");
      }

      // Update the existing unverified document
      existingUser.username = username;
      existingUser.password = password; // Mongoose pre-save will hash this again
      await existingUser.save();

    } else {
      // CASE C: Brand new user. Create them.
      const usernameExists = await User.findOne({ username });
      
      if (usernameExists) {
        throw new AppError(400, "Username already taken");
      }

      await User.create({
        username,
        email,
        password,
        emailVerified: false,
      });
    }

    // --- Common Logic for Case B (Unverified Update) & Case C (New User) ---

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete old OTPs for this email to keep it clean
    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otpHash,
      purpose: "register",
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendOtpEmail(email, "Verify your email for Solance", otp);

    // Return the success payload back to the controller
    return {
      message: "Signup successful. OTP sent to email."
    };

  } catch (error) {
    // Handle specific Mongo duplicate key error (Race conditions)
    if (error.code === 11000) {
       throw new AppError(400, "Username or Email already taken");
    }
    
    // If the error is already an AppError (from our manual throws above), pass it through
    if (error instanceof AppError) {
      throw error;
    }

    // Otherwise, it's an unexpected crash
    console.error("Register service error:", error);
    throw new AppError(500, "Server error");
  }
};