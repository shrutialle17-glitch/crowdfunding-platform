const express = require('express');
const { getAllReports, resolveReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.route('/')
  .get(auth, roleGuard(['admin']), getAllReports);

router.route('/:id/resolve')
  .patch(auth, roleGuard(['admin']), resolveReport);

module.exports = router;
