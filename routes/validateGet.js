import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/validateData", async (req, res) => {
  try {
    console.log("Received GET request to /validateData");

    const studentNumber = req.query.studentNumber;
    console.log("Student Number:", studentNumber);

    if (!studentNumber) {
      return res.status(400).json({
        error: "Student number is required in the query parameters.",
      });
    }

    const q = "SELECT course_id FROM validate WHERE student_number = ?";

    // Use async/await for better readability
    const [data] = await pool.query(q, [studentNumber]);

    if (data.length === 0) {
      return res.status(200).json([]);
    }

    return res.json(data);
  } catch (error) {
    console.error("Error in /validateData route:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

router.get("/validate", async (req, res) => {
  try {
    console.log("Received GET request to /validate");

    const studentNumber = req.query.student_number;

    const q = "SELECT * FROM validate WHERE student_number = ?";

    // Use async/await for better readability
    const [data] = await pool.query(q, [studentNumber]);

    return res.json(data);
  } catch (error) {
    console.error("Error in /validate route:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

router.get("/validation-status", async (req, res) => {
  try {
    const studentNumber = req.query.student_number;
    const course_id = req.query.course_id;

    const q =
      "SELECT date_validated FROM validate WHERE student_number = ? AND course_id = ?";

    // Use async/await for better readability
    const [data] = await pool.query(q, [studentNumber, course_id]);

    if (data.length === 0) {
      return res.status(200).json({ date_validated: null });
    }

    return res.status(200).json({ date_validated: data[0].date_validated });
  } catch (error) {
    console.error("Error in /validation-status route:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

router.get("/fetch_course_codes", async (req, res) => {
  try {
    // Use the promise-based query method with the pool
    const [rows] = await pool.execute("SELECT course_id FROM validate");

    // Extract course codes from the result
    const courseCodes = rows.map((row) => row.course_code);

    // Send the course codes as JSON
    res.status(200).json({ course_codes: courseCodes });
  } catch (dbError) {
    console.error("Database error:", dbError);
    res.status(500).json({
      error:
        "Internal Server Error. Check server and database logs for details.",
      details: dbError.message,
    });
  }
});

export default router;
