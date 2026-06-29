const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { bookmarkCampaign } = require('../controllers/socialController');

router.post('/campaigns/:id/bookmark', auth, bookmarkCampaign);

module.exports = router;
