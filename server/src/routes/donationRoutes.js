const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createDonation, 
  getCampaignDonations, 
  getUserDonations, 
  downloadReceipt,
  getRecentDonations
} = require('../controllers/donationController');

router.post('/campaigns/:id/donate', auth, createDonation);
/* router.get('/campaigns/:id/donations', getCampaignDonations);

// Global recent donations
router.get('/donations/recent', getRecentDonations);

// User-specific donations
router.get('/users/me/donations', auth, getUserDonations); */

// Receipts
router.get('/donations/:id/receipt', auth, downloadReceipt); 
module.exports = router;