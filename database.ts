import mysql from "mysql2/promise";
import type { Pool, PoolOptions } from "mysql2/promise";

// Database config with proper typing
const dbConfig: PoolOptions = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "my-secret-pw",
  database: process.env.DB_NAME || "mydb",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a connection pool
const pool: Pool = mysql.createPool(dbConfig);

// Test DB connection
async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
  }
}

export { pool, testConnection };
