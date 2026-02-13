const { Pool } = require('pg');
require('dotenv').config();

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function test() {
    console.log("Connecting...");
    try {
        const client = await pool.connect();
        console.log("Connected!");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0].now);
        await client.release();
        console.log("Released.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

test();
