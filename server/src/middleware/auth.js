const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required. No token provided.', code: 'UNAUTHORIZED' } });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: { message: 'Token expired', code: 'TOKEN_EXPIRED' } });
    }
    return res.status(401).json({ success: false, error: { message: 'Invalid token', code: 'UNAUTHORIZED' } });
  }
};

module.exports = auth;
