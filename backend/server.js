const app = require('./app');
const db = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

/**
 * Initializes the server after ensuring the database connection is established.
 */
const startServer = async () => {
    try {
        // Test database connection (async check)
        await db.query('SELECT 1');
        console.log('✅ MySQL Database connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // Exit process if DB connection fails
        process.exit(1);
    }
};

startServer();
