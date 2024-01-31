import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/validate", async (req, res) => {
  console.log("Received request body:", req.body);

  const dataToValidate = req.body;

  if (dataToValidate.length === 0) {
    return res.status(400).json({ error: "No data to validate" });
  }

  try {
    await Promise.all(
      dataToValidate.map(async (item) => {
        const studentNumber = item.student_number;
        const gradeId = item.grade_id;

        // Parse and validate the date
        const dateValidated = new Date(item.date_validated);
        if (isNaN(dateValidated)) {
          throw new Error("Invalid data format");
        }

        const formattedDate = dateValidated.toISOString().slice(0, 10);

        const checkDuplicateSql = `
          SELECT COUNT(*) as count
          FROM validate
          WHERE student_number = ? AND course_id = ? AND date_validated IS NOT NULL
        `;

        console.log("Check duplicate SQL:", checkDuplicateSql);
        console.log("Values for duplicate check:", [
          studentNumber,
          item.course_id,
        ]);

        const [result] = await pool.query(checkDuplicateSql, [
          studentNumber,
          item.course_id,
        ]);

        if (result && result[0] && result[0].count > 0) {
          // Skip inserting duplicate record
          console.log("Duplicate record found. Skipping insertion.");
        } else {
          const sql = `
    INSERT INTO validate (
      student_number, grade_id, faculty_id, date_validated, course_id
    ) VALUES (?, ?, ?, ?, ?)
  `;

          console.log("Insertion SQL:", sql);
          console.log("Values for insertion:", [
            studentNumber,
            gradeId,
            item.faculty_id,
            formattedDate,
            item.course_id,
          ]);

          const values = [
            studentNumber,
            gradeId,
            item.faculty_id,
            formattedDate,
            item.course_id,
          ];

          await pool.query(sql, values);
          console.log("Data inserted successfully");
        }
      })
    );

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(error.message === "Invalid data format" ? 400 : 500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

export default router;
