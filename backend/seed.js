const db = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUser() {
    const username = 'AdminTester';
    const email = 'admin@example.com';
    const password = 'Password123!';

    try {
        console.log("Checking for existing test user...");
        const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            console.log("✅ Test user already exists.");
        } else {
            console.log("Creating test user...");
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );
            console.log("✅ Test user created successfully!");
        }

        console.log("\n--------------------------------");
        console.log("CREDENTIALS:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("--------------------------------\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
}

seedUser();
