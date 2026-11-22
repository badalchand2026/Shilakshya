export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check whether authentication middleware ran first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    // Check whether the user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    // User has permission
    next();
  };
};