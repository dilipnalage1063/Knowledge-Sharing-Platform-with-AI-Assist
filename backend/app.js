const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json()); // Built-in JSON parser
app.use(express.urlencoded({ extended: true }));

// Health Check / Root Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "AI-Powered Knowledge Sharing Platform API is live"
    });
});

// Route mounting
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/ai', aiRoutes);

// Centralized Error Handling (must be the last middleware)
app.use(errorMiddleware);

module.exports = app;
