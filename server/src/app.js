const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const campaignRoutes = require('./routes/campaignRoutes');
const updateRoutes = require('./routes/updateRoutes');

const userRoutes = require('./routes/userRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const kycRoutes = require('./routes/kycRoutes');
const reportRoutes = require('./routes/reportRoutes');

const donationRoutes = require('./routes/donationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const socialRoutes = require('./routes/socialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

app.use('/api/', limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= Routes =================

// Authentication
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/updates', updateRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use('/api/v1', donationRoutes);
app.use('/api/v1', commentRoutes);
app.use('/api/v1', socialRoutes);
app.use('/api/v1/notifications', notificationRoutes);


// Home
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anti Crowd Backend Running'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Error Handler
app.use(errorHandler);

module.exports = app;