
import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import { validationResult } from "express-validator";

export const  verifyClerkAuth = async (req, res, next) => {
  try {

  
    const { userId } = getAuth(req);
    
    console.log("userId->>",userId)
   
  
  
    const clerkUser = await clerkClient.users.getUser(userId);
    const user = await User.findOne({ clerk_id: clerkUser.id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.body.userId = userId;
    console.log("authenticationsuccessful")
    next();
  } catch (error) {
    console.log("Clerk authentication error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
;