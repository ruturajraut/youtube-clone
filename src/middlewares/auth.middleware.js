
// this middleware verify user is available or not

import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
// import User from "../models/user.models.js"; // Assuming you have a User model
import { User } from "../models/user.models.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        throw new ApiError(401, "Access token is required");
    }
    
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken"); // Ensure user exists
        if (!user) {
            
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user; // Attach user info to request object
        next();
    } catch (error) {
        return new ApiError(401, "Invalid or expired access token");
    }
});


