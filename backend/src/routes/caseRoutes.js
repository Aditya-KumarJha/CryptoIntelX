const express = require('express');
const router = express.Router();
const { createCase, exportSnapshot } = require('../controllers/caseController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createCase);
router.post('/export', protect, exportSnapshot);

module.exports = router;
