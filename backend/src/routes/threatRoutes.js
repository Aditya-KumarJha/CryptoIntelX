const express = require('express');
const router = express.Router();
const { getOverview, getRecent, getCategories, getTrend } = require('../controllers/threatController');
const { protect } = require('../middlewares/authMiddleware');

// Overview KPIs
router.get('/overview', protect, getOverview);

// Recent high-risk addresses (sorted by risk/updated)
router.get('/recent', protect, getRecent);

// Category breakdown counts
router.get('/categories', protect, getCategories);

// Daily detections trend
router.get('/trend', protect, getTrend);

module.exports = router;
