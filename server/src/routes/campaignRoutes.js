const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload');
const { 
  getCampaigns, 
  getTrendingCampaigns, 
  getCampaignById, 
  getRelatedCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign, 
  approveCampaign, 
  rejectCampaign, 
  featureCampaign 
} = require('../controllers/campaignController');

// Public routes
router.get('/', getCampaigns);
router.get('/trending', getTrendingCampaigns);
router.get('/:id', getCampaignById);
router.get('/:id/related', getRelatedCampaigns);

// Creator routes
router.post('/', auth, roleGuard(['creator', 'admin']), upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 5 }]), createCampaign);
router.put('/:id', auth, roleGuard(['creator']), upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 5 }]), updateCampaign);
router.delete('/:id', auth, roleGuard(['creator']), deleteCampaign);

// Admin routes
router.patch('/:id/approve', auth, roleGuard(['admin']), approveCampaign);
router.patch('/:id/reject', auth, roleGuard(['admin']), rejectCampaign);
router.patch('/:id/feature', auth, roleGuard(['admin']), featureCampaign);

module.exports = router;
