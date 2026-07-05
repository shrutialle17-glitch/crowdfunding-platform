const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload');
const { submitKYC, reviewKYC } = require('../controllers/kycController');

router.post('/submit', auth, roleGuard(['creator']), upload.fields([{ name: 'idDocument', maxCount: 1 }, { name: 'selfie', maxCount: 1 }, { name: 'addressProof', maxCount: 1 }]), submitKYC);
router.patch('/:id/review', auth, roleGuard(['admin']), reviewKYC);

module.exports = router;
