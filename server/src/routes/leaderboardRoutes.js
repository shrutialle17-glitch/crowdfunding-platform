const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// GET /api/v1/leaderboard
router.get('/', getLeaderboard);

module.exports = router;
