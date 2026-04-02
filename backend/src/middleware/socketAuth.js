import jwt from "jsonwebtoken";
import cookie from "cookie"; // You might need to run: npm install cookie
import { ENV } from "../lib/env.js";
import User from "../models/users.js";

export const socketAuth = async(socket, next) => {
  try {
    // 1. Get the cookies from the handshake header
    // Unlike Express req.cookies, socket.io sends them as a raw string string
    const rawCookies = socket.handshake.headers.cookie;

    if (!rawCookies) {
      return next(new Error("Authentication error: No cookies found"));
    }

    // 2. Parse the string into an object
    const parsedCookies = cookie.parse(rawCookies);
    const token = parsedCookies.accessToken;

    if (!token) {
      return next(new Error("Authentication error: No access token"));
    }

    // 3. Verify the Token
    const decoded = jwt.verify(token, ENV.ACCESS_SECRET);
    
    const user = await User.findById(decoded.id).select("username email role _id");
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // 5. Attach the full user object to the socket
    socket.user = user; 
    
    // 6. Allow connection
    next();

  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};