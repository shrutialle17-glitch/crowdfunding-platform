const express = require('express');
const { getAllUsers, updateUserStatus, updateTrustScore, updateMe, getMe, toggleBookmark, getSavedCampaigns } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.route('/')
  .get(auth, roleGuard(['admin']), getAllUsers);

router.route('/:id/status')
  .patch(auth, roleGuard(['admin']), updateUserStatus);

router.route('/:id/trust')
  .patch(auth, roleGuard(['admin']), updateTrustScore);

router.route('/me')
  .get(auth, getMe)
  .put(auth, updateMe);

router.get('/me/bookmarks', auth, getSavedCampaigns);
router.post('/me/bookmarks/:id', auth, toggleBookmark);

module.exports = router;
