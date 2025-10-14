const express = require('express');
const router = express.Router();
const { searchInvestigations } = require('../controllers/investigationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', protect, searchInvestigations);

module.exports = router;
