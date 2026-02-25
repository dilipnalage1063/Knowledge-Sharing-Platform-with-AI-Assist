const db = require('../config/db');

const User = {
    /**
     * Create a new user in the database
     */
    create: async (username, email, hashedPassword) => {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        return result.insertId;
    },

    /**
     * Find a user by email
     */
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    /**
     * Find a user by ID
     */
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }
};

module.exports = User;
