// db.js

import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

// Validate required environment variables ...
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
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

 
});

console.log("Database connection pool created.");

// Export the pool for use in other modules
export { pool };

// Gracefully shut down the pool when the application is terminating
process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing database connections...");
  pool.end(function (err) {
    if (err) {
      console.error("Error closing the database connection pool:", err);
    } else {
      console.log("Database connection pool closed.");
    }
    process.exit(0);
  });
});
