const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, refresh, logout } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { success: false, error: { message: 'Too many login attempts. Please try again after 15 minutes.', code: 'RATE_LIMIT_EXCEEDED' } }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
