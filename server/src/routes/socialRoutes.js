const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { bookmarkCampaign, likeCampaign, followCreator } = require('../controllers/socialController');

router.post('/campaigns/:id/bookmark', auth, bookmarkCampaign);
router.post('/campaigns/:id/like', auth, likeCampaign);
router.post('/users/:id/follow', auth, followCreator);

module.exports = router;
