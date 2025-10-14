const express = require('express');
const router = express.Router();
const { createCase, listCases, updateCaseStatus, getCase, exportSnapshot } = require('../controllers/caseController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, listCases);
router.get('/:id', protect, getCase);
router.post('/', protect, createCase);
router.patch('/:id', protect, updateCaseStatus);
router.post('/export', protect, exportSnapshot);

module.exports = router;
