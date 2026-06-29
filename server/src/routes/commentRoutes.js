const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getComments, postComment } = require('../controllers/commentController');

router.get('/campaigns/:id/comments', getComments);
router.post('/campaigns/:id/comments', auth, postComment);

module.exports = router;
