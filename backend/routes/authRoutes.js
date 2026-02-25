const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected Route Example
// This allows a user to get their own profile info based on the token
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

module.exports = router;
