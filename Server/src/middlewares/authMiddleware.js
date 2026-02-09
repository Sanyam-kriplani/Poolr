export const authenticateUser = (req, res, next) => {
  if (!req.session) {
    return res.status(401).json({ message: "Unauthorized" });
  }


  
  // PASSWORD_RESET session restrictions
  if (req.session.type === "PASSWORD_RESET") {
    // Allow only reset password related routes
    if (req.originalURL==='/api/auth/resetPass') {
      return res.status(403).json({ message: "Reset session only" });
    }

    req.user_id = req.session.userId;
    return next();
  }

  // LOGIN session
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};