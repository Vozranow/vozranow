import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";
import Otp from "../models/otp.js";
import ListenerApplication from "../models/listenerApplication.js";
import ListenerProfile from "../models/listenerProfile.js";
import { sendForgotEmail, sendOtpEmail } from "../lib/sendMail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    // 1. Check if ANY user exists with this email (verified or not)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // CASE A: User is already verified. Stop them.
      if (existingUser.emailVerified) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // CASE B: User exists but is UNVERIFIED (The "Come back next day" case)
      // We update their details instead of creating a new document.
      
      // Optional: Check if the new username is taken by someone else
      const usernameTaken = await User.findOne({ username, _id: { $ne: existingUser._id } });
      if (usernameTaken) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Update the existing unverified document
      existingUser.username = username;
      existingUser.password = password; // Mongoose pre-save will hash this again
      await existingUser.save();

      // Proceed to generate and send OTP...
      
    } else {
      // CASE C: Brand new user. Create them.
      
      // Check username uniqueness
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already taken" });
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

    return res.status(201).json({
      message: "Signup successful. OTP sent to email.",
    });

  } catch (error) {
    console.error("Register error:", error);
    // Handle specific Mongo duplicate key error just in case of race conditions
    if (error.code === 11000) {
       return res.status(400).json({ message: "Username or Email already taken" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc POST verifying the request sent by new users
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }


    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or invalid",
      });
    }


    if (otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;

      // Lock after 5 attempts
      if (otpRecord.attempts >= 5) {
        otpRecord.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min
      }

      await otpRecord.save();
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    user.emailVerified = true;
    await user.save();


    await otpRecord.deleteOne();

    // const accessToken = accessToken(user._id);
    // never do this will throw error of reference since lhs and rhs name same
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    // Refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });


  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc POST resending otp 
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    await Otp.deleteMany({ email });


    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.create({
      email,
      otpHash,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      lockedUntil: null,
    });
    await sendOtpEmail(email, "Verify your email for Solance", otp);

    return res.status(200).json({
      message: "OTP resent successfully",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc POST logging in
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    //explicitly select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000, // 5 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


// @desc getting user profile after user is authenticated GET
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Server error",
    });
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
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000, // 5 min
    });

    return res.status(200).json({
      message: "Access token refreshed",
    });

  } catch (error) {
    // Invalid / expired refresh token
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
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
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // IMPORTANT: do NOT reveal user existence
      return res.status(401).json({
        message: "Please create an account first",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please make an account first",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log(resetToken);
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await Otp.deleteMany({
      email,
      purpose: "password_reset",
    });

    await Otp.create({
      email,
      otpHash: resetTokenHash,
      purpose: "password_reset",
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      attempts: 0,
    });

    const resetLink = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendForgotEmail(
      email,
      "Reset your Solance password",
      resetLink
    );

    return res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


// @desc POST reset password using token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const otpRecord = await Otp.findOne({
      otpHash: tokenHash,
      purpose: "password_reset",
      expiresAt: { $gt: Date.now() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const user = await User.findOne({ email: otpRecord.email }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    user.password = newPassword; 
    user.passwordChangedAt = new Date();
    await user.save();

    await otpRecord.deleteOne(); //del the hashed token

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Password reset successful. Please log in again.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc PATCH update profile (username / email)
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { username, email } = req.body;
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ======================
       USERNAME CHANGE (30 Days Limit)
    ====================== */
    if (username && username !== user.username) {
      
      // 1. Rate Limit Check
      if (user.usernameLastChangedAt) {
        const daysSinceLastChange = (Date.now() - new Date(user.usernameLastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastChange < 30) {
          const daysLeft = Math.ceil(30 - daysSinceLastChange);
          return res.status(429).json({
            message: `You can change your username again in ${daysLeft} days.`
          });
        }
      }

      // 2. Uniqueness Check
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // 3. Update
      user.username = username;
      user.usernameLastChangedAt = Date.now();
    }

    /* ======================
       EMAIL CHANGE (60 Days Limit)
    ====================== */
    if (email && email !== user.email) {
      
      // 1. Rate Limit Check
      if (user.emailLastChangedAt) {
        const daysSinceLastChange = (Date.now() - new Date(user.emailLastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastChange < 60) {
          const daysLeft = Math.ceil(60 - daysSinceLastChange);
          return res.status(429).json({
            message: `You can change your email again in ${daysLeft} days.`
          });
        }
      }

      // 2. Uniqueness Check
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // 3. OTP Logic (Same as before)
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

      await sendOtpEmail(email, "Confirm your new email", otp);

      return res.status(200).json({
        message: "OTP sent to new email for verification",
        emailChangePending: true,
      });
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc POST verify email change OTP
export const verifyEmailChangeOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        message: "OTP is required",
      });
    }
    const user = req.user;

    const otpRecord = await Otp.findOne({
      email: user.email,
      purpose: "email_change",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or invalid",
      });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.email = otpRecord.meta.newEmail;
    user.emailVerified = true;
    user.emailLastChangedAt = Date.now();
    await user.save();
    await otpRecord.deleteOne();

    return res.status(200).json({
      message: "Email updated successfully",
      email: user.email,
    });

  } catch (error) {
    console.error("Verify email change OTP error:", error);
    return res.status(500).json({
      message: "Server error",
    });
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