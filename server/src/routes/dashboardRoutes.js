const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { 
  getDonorDashboard, 
  getCreatorDashboard, 
  getAdminDashboard,
  getCreatorSupporters
} = require('../controllers/dashboardController');

// Donor Dashboard
router.get('/donor', auth, roleGuard(['donor', 'creator', 'admin']), getDonorDashboard); // Creators and admins can also be donors

// Creator Dashboard
router.get('/creator', auth, roleGuard(['creator', 'admin']), getCreatorDashboard);
router.get('/creator/supporters', auth, roleGuard(['creator', 'admin']), getCreatorSupporters);

// Admin Dashboard
router.get('/admin', auth, roleGuard(['admin']), getAdminDashboard);

module.exports = router;
