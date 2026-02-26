const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db');

/**
 * Register a new user
 */
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create(username, email, hashedPassword);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get logged-in user's profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, username, email, role, bio, expertise, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!rows[0]) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
};

/**
 * Update logged-in user's profile (bio & expertise)
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { bio, expertise } = req.body;
        await db.execute(
            'UPDATE users SET bio = ?, expertise = ? WHERE id = ?',
            [bio || null, expertise || null, req.user.id]
        );
        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};
