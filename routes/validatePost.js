import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

const queryAsync = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

router.post("/validate", async (req, res) => {
  console.log("Received request body:", req.body);

  const dataToValidate = req.body;

  if (dataToValidate.length === 0) {
    return res.status(400).json({ error: "No data to validate" });
  }

  try {
    const insertPromises = dataToValidate.map(async (item) => {
      const studentNumber = item.student_number;
      const gradeId = item.grade_id;
      console.log("Received date to validate:", item.date_validated);
      // Parse the date from the request data
      const dateValidated = new Date(item.date_validated);

      // Check if the date is a valid date
      if (isNaN(dateValidated)) {
        throw new Error("Invalid date format");
      }
      const formattedDate = dateValidated.toISOString().slice(0, 10);

      const checkDuplicateSql = `
        SELECT COUNT(*) as count
        FROM validate
        WHERE student_number = ? AND course_id = ? AND date_validated IS NOT NULL
      `;
      const [result] = await queryAsync(checkDuplicateSql, [
        studentNumber,
        item.course_id,
      ]);

      if (result && result.count > 0) {
        // Skip inserting duplicate record
        console.log("Duplicate record found. Skipping insertion.");
        return;
      }
      const sql =
        `INSERT INTO validate (` +
        " `student_number`, `grade_id`, `faculty_id`, `date_validated`, `course_id`" +
        ") VALUES (?, ?, ?, ?, ?)";
      const values = [
        studentNumber,
        gradeId,
        item.faculty_id,
        formattedDate,
        item.course_id,
      ];

      await queryAsync(sql, values);
    });

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    if (error.message === "Invalid date format") {
      res.status(400).json({ error: "Invalid date format" });
    } else {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
});

export default router;
