const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected Route - get decoded token info
router.get('/me', protect, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// Protected Profile Routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
