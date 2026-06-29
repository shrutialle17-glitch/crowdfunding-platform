const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required.', code: 'UNAUTHORIZED' } });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: `Access forbidden: requires one of the following roles: ${allowedRoles.join(', ')}`, 
          code: 'FORBIDDEN' 
        } 
      });
    }

    next();
  };
};

module.exports = roleGuard;
