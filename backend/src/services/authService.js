import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";
import Otp from "../models/otp.js";


import bcrypt from "bcryptjs";
import crypto from "crypto";
import redis from "../lib/redis.js";
import { emailQueue } from "../queues/emailQueue.js";
// import { AppError } from '../lib/appError.js';

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
  try {
    // Initial validation
    if (!username || !email || !password) {
      return { success: false, statusCode: 400, message: "Username, email and password are required" };
    }

    // 1. Check if ANY user exists with this email (verified or not)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // CASE A: User is already verified. Stop them.
      if (existingUser.emailVerified) {
        return { success: false, statusCode: 400, message: "Email already registered" };
      }

      // CASE B: User exists but is UNVERIFIED
      const usernameTaken = await User.findOne({ username, _id: { $ne: existingUser._id } });
      if (usernameTaken) {
        return { success: false, statusCode: 400, message: "Username already taken" };
      }

      // Update the existing unverified document
      existingUser.username = username;
      existingUser.password = password; 
      await existingUser.save();

    } else {
      // CASE C: Brand new user. Create them.
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return { success: false, statusCode: 400, message: "Username already taken" };
      }

      await User.create({
        username,
        email,
        password,
        emailVerified: false,
      });
    }

    // --- Common Logic for Case B & Case C ---
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

    // await sendOtpEmail(email, "Verify your email for Solance", otp);

    await emailQueue.add('send-otp', {
      type: 'OTP',
      to: email,
      sub: "Verify your email for Solance",
      payload: { otp }
    });

    // If everything goes perfectly, return success!
    return {
      success: true,
      statusCode: 201,
      data: { message: "Signup successful. OTP sent to email." }
    };

  } catch (error) {
    // Handle specific Mongo duplicate key error just in case of race conditions
    if (error.code === 11000) {
      return { success: false, statusCode: 400, message: "Username or Email already taken" };
    }
    
    // If it's a real server crash (like MongoDB disconnecting), we throw it so the Controller catch block gets it
    throw error; 
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    if (!email || !otp) {
      return { success: false, statusCode: 400, message: "Email and OTP are required" };
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return { success: false, statusCode: 400, message: "OTP expired or invalid" };
    }

    // Optional pro-tip: You might want to check if (otpRecord.lockedUntil > Date.now()) here in the future!

    if (otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return { success: false, statusCode: 400, message: "OTP expired" };
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      // Safely increment attempts (in case it was undefined)
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;

      // Lock after 5 attempts
      if (otpRecord.attempts >= 5) {
        otpRecord.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min
      }

      await otpRecord.save();
      return { success: false, statusCode: 400, message: "Invalid OTP" };
    }

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, statusCode: 400, message: "User not found" };
    }

    // Mark user as verified
    user.emailVerified = true;
    await user.save();

    // Clean up OTP
    await otpRecord.deleteOne();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Return the tokens and user info back to the controller
    return {
      success: true,
      statusCode: 200,
      data: {
        message: "Email verified successfully",
        tokens: {
          accessToken,
          refreshToken
        },
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        }
      }
    };
} catch (error) {
    // Let the controller catch database crashes
    throw error;
  }
};

export const resendOtp = async ({ email }) => {
  try {
    if (!email) {
      return { success: false, statusCode: 400, message: "Email is required" };
    }

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

    if (user.emailVerified) {
      return { success: false, statusCode: 400, message: "Email is already verified" };
    }

    // Clean up any old OTPs for this user
    await Otp.deleteMany({ email });

    // Generate and hash new OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Save the new OTP
    await Otp.create({
      email,
      otpHash,
      purpose: "register",
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      lockedUntil: null,
    });

    // Send the email
    // await sendOtpEmail(email, "Verify your email for Solance", otp);
    await emailQueue.add('send-otp', {
      type: 'OTP',
      to: email,
      sub: "Verify your email for Solance",
      payload: { otp }
    });

    return {
      success: true,
      statusCode: 200,
      data: { message: "OTP resent successfully" }
    };

  } catch (error) {
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    if (!email || !password) {
      return { success: false, statusCode: 400, message: "Email and password are required" };
    }

    // Explicitly select password for the bcrypt comparison
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return { success: false, statusCode: 401, message: "Invalid email or password" };
    }

    if (!user.emailVerified) {
      return { success: false, statusCode: 403, message: "Please verify your email before logging in" };
    }

    if (user.isBlocked) {
      return { success: false, statusCode: 403, message: "Your account has been blocked" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, statusCode: 401, message: "Invalid email or password" };
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Bust the Redis cache so they get fresh data on their next request
    if (redis.status === 'ready') {
      await redis.del(`user:${user._id}`);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        message: "Login successful",
        tokens: { accessToken, refreshToken },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        }
      }
    };

  } catch (error) {
    throw error;
  }
};

export const getProfile = async (user) => {
  if (!user) {
    return { success: false, statusCode: 404, message: "User not found" };
  }

  return {
    success: true,
    statusCode: 200,
    data: { user }
  };
};

export const forgotPassword = async ({ email }) => {
  try {
    if (!email) {
      return { success: false, statusCode: 400, message: "Email is required" };
    }

    const user = await User.findOne({ email });
    
    if (!user) {
    
      return { success: false, statusCode: 404, message: "Please create an account first" };
    }

    if (!user.emailVerified) {
      return { success: false, statusCode: 400, message: "Please verify your email first" };
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Clean up old reset tokens for this user
    await Otp.deleteMany({ email, purpose: "password_reset" });

    // Save the new hashed token
    await Otp.create({
      email,
      otpHash: resetTokenHash,
      purpose: "password_reset",
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      attempts: 0,
    });

    const resetLink = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // await sendForgotEmail(email, "Reset your Solance password", resetLink);

    await emailQueue.add('send-forgot-password', {
      type: 'FORGOT_PASSWORD',
      to: email,
      sub: "Reset your Solance password",
      payload: { resetLink }
    });

    return {
      success: true,
      statusCode: 200,
      data: { message: "If the email exists, a reset link has been sent" }
    };

  } catch (error) {
    throw error;
  }
};

export const resetPassword = async ({ token, newPassword }) => {
  try {
    if (!token || !newPassword) {
      return { success: false, statusCode: 400, message: "Token and new password are required" };
    }

    // Hash the incoming token to compare with the database
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const otpRecord = await Otp.findOne({
      otpHash: tokenHash,
      purpose: "password_reset",
      expiresAt: { $gt: Date.now() },
    });

    if (!otpRecord) {
      return { success: false, statusCode: 400, message: "Invalid or expired reset link" };
    }

    // Explicitly select password to update it
    const user = await User.findOne({ email: otpRecord.email }).select("+password");
    if (!user) {
      return { success: false, statusCode: 400, message: "User not found" };
    }

    // Update password (Mongoose pre-save hook will hash it)
    user.password = newPassword; 
    user.passwordChangedAt = new Date();
    await user.save();

    // Clean up the used token
    await otpRecord.deleteOne(); 
    
    // Bust the Redis cache so old sessions are invalidated
    if (redis.status === 'ready') {
      await redis.del(`user:${user._id}`);
    }

    return {
      success: true,
      statusCode: 200,
      data: { message: "Password reset successful. Please log in again." }
    };

  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (cachedUser, { username, email }) => {
  try {
    const user = await User.findById(cachedUser._id || cachedUser.id);
    if (!user) {
      return { success: false, statusCode: 404, message: "User not found" };
    }
    const isUsernameSame = !username || username === user.username;
    const isEmailSame = !email || email === user.email;

    if (isUsernameSame && isEmailSame) {
      return { 
        success: true, // Returning true with a 200 so the frontend doesn't throw a scary red error
        statusCode: 200, 
        data: { 
          message: "No changes were made to your profile.",
          user: { username: user.username, email: user.email }
        } 
      };
    }
    /* ======================
       USERNAME CHANGE (30 Days Limit)
    ====================== */
    if (username && username !== user.username) {
      if (user.usernameLastChangedAt) {
        const daysSinceLastChange = (Date.now() - new Date(user.usernameLastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastChange < 30) {
          const daysLeft = Math.ceil(30 - daysSinceLastChange);
          return { success: false, statusCode: 429, message: `You can change your username again in ${daysLeft} days.` };
        }
      }

      const exists = await User.findOne({ username });
      if (exists) {
        return { success: false, statusCode: 400, message: "Username already taken" };
      }

      user.username = username;
      user.usernameLastChangedAt = Date.now();
    }

    /* ======================
       EMAIL CHANGE (60 Days Limit)
    ====================== */
    if (email && email !== user.email) {
      if (user.emailLastChangedAt) {
        const daysSinceLastChange = (Date.now() - new Date(user.emailLastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastChange < 60) {
          const daysLeft = Math.ceil(60 - daysSinceLastChange);
          return { success: false, statusCode: 429, message: `You can change your email again in ${daysLeft} days.` };
        }
      }

      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return { success: false, statusCode: 400, message: "Email already in use" };
      }

      await Otp.deleteMany({ email: user.email, purpose: "email_change" });

      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      await Otp.create({
        email: user.email,
        otpHash,
        purpose: "email_change",
        meta: { newEmail: email },
        expiresAt: Date.now() + 5 * 60 * 1000, 
      });

      // await sendOtpEmail(email, "Confirm your new email", otp);

      await emailQueue.add('send-email-change-otp', {
        type: 'OTP',
        to: email,
        sub: "Confirm your new email",
        payload: { otp }
      });

      // Early return because we DO NOT save the user document yet when changing an email
      return {
        success: true,
        statusCode: 200,
        data: {
          message: "OTP sent to new email for verification",
          emailChangePending: true,
        }
      };
    }

    // Only save if it was just a username change
    await user.save();

    if (redis.status === 'ready') {
      await redis.del(`user:${user._id}`);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        message: "Profile updated successfully",
        user: {
          username: user.username,
          email: user.email,
        }
      }
    };

  } catch (error) {
    throw error;
  }
};

export const verifyEmailChangeOtp = async (cachedUser, { otp }) => {
  try {
    const user = await User.findById(cachedUser._id || cachedUser.id);
    if (!otp) {
      return { success: false, statusCode: 400, message: "OTP is required" };
    }

    const otpRecord = await Otp.findOne({
      email: user.email,
      purpose: "email_change",
    });

    if (!otpRecord) {
      return { success: false, statusCode: 400, message: "OTP expired or invalid" };
    }

    if (otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return { success: false, statusCode: 400, message: "OTP expired" };
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      // Safely increment attempts
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      await otpRecord.save();
      return { success: false, statusCode: 400, message: "Invalid OTP" };
    }

    // Apply the new email from the OTP's meta object
    user.email = otpRecord.meta.newEmail;
    user.emailVerified = true;
    user.emailLastChangedAt = Date.now();
    await user.save();
    
    await otpRecord.deleteOne();

    if (redis.status === 'ready') {
      await redis.del(`user:${user._id}`);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        message: "Email updated successfully",
        email: user.email,
      }
    };

  } catch (error) {
    throw error;
  }
}