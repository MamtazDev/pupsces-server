import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/grades", async (req, res) => {
  try {
    const studentNumber = req.query.studentNumber;

    if (!studentNumber) {
      return res
        .status(400)
        .json({ error: "Missing 'studentNumber' parameter" });
    }

    const q = `SELECT * FROM grades WHERE student_number = ?`;

    try {
      const [data] = await pool.query(q, [studentNumber]);

      // Check if data is empty
      if (data.length === 0) {
        return res.status(404).json({
          message: "No grades found for the specified student number",
        });
      }

      return res.json(data);
    } catch (error) {
      console.error("Error querying the database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error in /grades route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/failedgrades", async (req, res) => {
  try {
    // SQL query to fetch records with grades 5 and -1
    const query = "SELECT * FROM grades WHERE grades = 5 OR grades = -1";

    try {
      // Execute the query using the connection pool
      const results = await pool.query(query);

      // Send the results as JSON response
      res.json(results);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error in /failedgrades route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
