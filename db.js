import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const setMaxUserConnections = async () => {
  try {
    console.log("Attempting to set max_user_connections...");
    const connection = await pool.getConnection();

    // Execute the SQL command to set max_user_connections
    const [results] = await connection.execute(
      "SET GLOBAL max_user_connections = 20"
    );

    console.log("max_user_connections set successfully", results);

    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    console.error("Error setting max_user_connections:", error);
  }
};

export { pool, setMaxUserConnections };
