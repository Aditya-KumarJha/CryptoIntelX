const express = require('express');
const router = express.Router();
const { expand, summary } = require('../controllers/networkController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/network/expand { address, limit?, minRisk? }
router.post('/expand', protect, expand);

// GET /api/network/summary/:address
router.get('/summary/:address', protect, summary);

module.exports = router;
