import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "mydatabase",
  port: process.env.DB_PORT || 3000,
});

export { pool };
