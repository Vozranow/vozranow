import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";
import redis from "../lib/redis.js";


export const protect = async(req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, ENV.ACCESS_SECRET);
    // console.log(decoded.id);

    const cacheKey = `user:${decoded.id}`;

    // ⚡ 2. CHECK REDIS FIRST
    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      // HIT: Parse and attach to request
      // Note: This is a plain JSON object, not a Mongoose document so when using user.save anywhere invalidate/del this cache key.
      req.user = JSON.parse(cachedUser);
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    // console.log(req.user);
    await redis.set(cacheKey, JSON.stringify(req.user), "EX", 36);

    next();
  } catch (error) {
  console.error(error);

  return res.status(401).json({
    message: "Invalid or expired token",
  });    //token is there but it has expired so frontend would have to call refresh
}
};




export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};