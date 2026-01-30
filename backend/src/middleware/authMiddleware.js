import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ENV } from "../lib/env.js";


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

    
    req.user = await User.findById(decoded.id).select('-password');
    console.log(req.user);

    next();
  } catch (error) {
  console.error(error);

  return res.status(401).json({
    message: "Invalid or expired token",
  });    //token is there but it has expired so fronend would have to call refresh
}
};



