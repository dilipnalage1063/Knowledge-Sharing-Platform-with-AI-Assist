const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware');

// All AI endpoints are protected as they are for registered users
router.post('/improve', protect, aiController.improveContent);
router.post('/summary', protect, aiController.generateSummary);
router.post('/suggest-tags', protect, aiController.suggestTags);

module.exports = router;
