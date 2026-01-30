import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";
import Otp from "../models/otp.js";
import { sendForgotEmail, sendOtpEmail } from "../lib/sendMail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
// Helper: Generate JWT
const generateAccessToken = (id) => {
  return jwt.sign({ id }, ENV.ACCESS_SECRET, {
    expiresIn: '300s',
  });
};
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, ENV.REFRESH_SECRET, {
    expiresIn: '1d',
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
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    await User.create({
      username,
      email,
      password, // will be hashed by schema pre-save
      emailVerified: false,
    });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // purane otp ko htadia just in case iss email se hai toh koi
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
    res.status(500).json({
      message: "Server error",
    });
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
      maxAge: 15 * 60 * 1000, // 15 minutes
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
      maxAge: 15 * 60 * 1000, // 15 min
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
    const decoded = jwt.verify(
      refreshToken,
      ENV.REFRESH_SECRET
    );
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
      },
      ENV.ACCESS_SECRET,
      {
        expiresIn: "300s",
      }
    );


    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
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
      message: "Session expired. Please log in again.",
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ======================
       USERNAME CHANGE
    ====================== */
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({
          message: "Username already taken",
        });
      }

      user.username = username;
    }

    /* ======================
       EMAIL CHANGE (OTP)
    ====================== */
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      // remove any previous email-change OTPs
      await Otp.deleteMany({
        email: user.email,
        purpose: "email_change",
      });

      const otp = generateOtp();
      console.log(otp);
      const otpHash = await bcrypt.hash(otp, 10);

      await Otp.create({
        email: user.email,          // current email (identity)
        otpHash,
        purpose: "email_change",
        meta: { newEmail: email },
        expiresAt: Date.now() + 5 * 60 * 1000, // 10 min
      });

      await sendOtpEmail(
        email,
        "Confirm your new email",
        otp
      );

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
    res.status(500).json({
      message: "Server error",
    });
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
