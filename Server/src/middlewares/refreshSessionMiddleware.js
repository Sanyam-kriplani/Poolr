const M = 1000 * 60 * 60 * 24;

export const refreshSession = async (req, res, next) => {
  const session = req.session;

  if (!session) return next();

  if (session.type !== "LOGIN") return next();

  if (session.expiresAt < Date.now()) {
    return res.status(401).json({ message: "Session expired" });
  }

  session.expiresAt = new Date(Date.now() + M);
  await session.save();
  next();
};