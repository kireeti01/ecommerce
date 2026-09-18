/**
 * Restrict access to specific roles
 * @param  {...string|string[]} roles - Allowed roles (e.g. 'admin' or ['admin'])
 */
const authorize = (...roles) => {
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. User role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};

module.exports = { authorize };
