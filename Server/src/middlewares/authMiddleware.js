import { log } from "console";
import User from "../models/userModel.js";

export const authenticateUser = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    console.log(req.session);
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.session.type === "PASSWORD_RESET" && req.originalUrl !== "/resetPass") {
    return res.status(403).json({ message: "Reset session only" });
  }

  req.user_id=req.session.userId;
  console.log("REQ.SESSION IN AUTH:", req.session);
  next();
};