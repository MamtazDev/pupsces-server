import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.get("/grades", (req, res) => {
  try {
    const studentNumber = req.query.studentNumber;

    const q = `SELECT * FROM grades WHERE student_number = ?`;
    pool.query(q, [studentNumber], (err, data) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.json(data);
    });
  } catch (error) {
    console.error("Error in /grades route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/failedgrades", (req, res) => {
  try {
    // SQL query to fetch records with grades 5 and -1
    const query = "SELECT * FROM grades WHERE grades = 5 OR grades = -1";

    // Execute the query using the connection pool
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Send the results as JSON response
      res.json(results);
    });
  } catch (error) {
    console.error("Error in /failedgrades route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
