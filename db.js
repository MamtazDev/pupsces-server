import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

// Validate required environment variables
const requiredEnvVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_DATABASE",
];
for (const envVar of requiredEnvVariables) {
  if (!process.env[envVar]) {
    console.error(
      `Missing or invalid value for ${envVar}. Please check your environment configuration.`
    );
    process.exit(1);
  }
}

// Create the database connection pool
let pool;
try {
  pool = mysql.createPool({
    connectionLimit: 1000,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  console.log("Database connection pool created.");
} catch (error) {
  console.error("Error creating database connection pool:", error);
  process.exit(1);
}

// Graceful shutdown when the application exits
process.on("SIGINT", async () => {
  try {
    // Close the database connection pool
    if (pool) {
      await pool.end();
      console.log("Database connection pool closed.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error closing database connection pool:", error);
    process.exit(1);
  }
});

export { pool };
