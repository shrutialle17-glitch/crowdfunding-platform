const express = require('express');
const router = express.Router();
const { createUpdate, getCampaignUpdates } = require('../controllers/updateController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

//router.post('/', auth, roleGuard(['creator']), createUpdate);
router.post(
    '/:campaignId',
    auth,
    roleGuard(['creator']),
    createUpdate
);
router.get('/:campaignId', getCampaignUpdates);

module.exports = router;
