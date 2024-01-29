import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.put("/update-grades", async (req, res) => {
  try {
    const { studentNumber, course_id, grades, remarks } = req.body;
    if (
      !studentNumber ||
      !course_id ||
      grades === undefined ||
      remarks === undefined
    ) {
      return res.status(400).json({ error: "Invalid request. Missing data." });
    }

    const selectSql = `SELECT * FROM grades WHERE student_number = ? AND course_id = ?`;
    const selectValues = [studentNumber, course_id];

    pool.query(selectSql, selectValues, async (selectErr, selectResult) => {
      if (selectErr) {
        console.error("Error checking for existing entry:", selectErr);
        return res.status(500).json({
          error: "Internal server error",
          details: selectErr.message,
        });
      }

      if (selectResult.length > 0) {
        const updateSql = `UPDATE grades SET grades = ?, remarks = ? WHERE student_number = ? AND course_id = ?`;
        const updateValues = [grades, remarks, studentNumber, course_id];

        pool.query(updateSql, updateValues, (updateErr) => {
          if (updateErr) {
            console.error("Error updating grades:", updateErr);
            res.status(500).json({
              error: "Internal server error",
              details: updateErr.message,
            });
          } else {
            console.log("Grades updated successfully");
            res.status(200).json({ message: "Grades updated successfully" });
          }
        });
      } else {
        const insertSql = `INSERT INTO grades (student_number, course_id, grades, remarks) VALUES (?, ?, ?, ?)`;
        const insertValues = [studentNumber, course_id, grades, remarks];

        pool.query(insertSql, insertValues, (insertErr) => {
          if (insertErr) {
            console.error("Error inserting new grades:", insertErr);
            res.status(500).json({
              error: "Internal server error",
              details: insertErr.message,
            });
          } else {
            console.log("New grades inserted successfully");
            res
              .status(200)
              .json({ message: "New grades inserted successfully" });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error updating/inserting grades:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.put("/grades/:studentNumber/:courseCode", (req, res) => {
  try {
    const course_id = req.params.course_id;
    const studentNumber = req.params.studentNumber;
    const updatedGrades = req.body.grades;

    console.log("PUT request received for studentNumber:", studentNumber);
    console.log("Course Code:", course_id);
    console.log("Updated Grades:", updatedGrades);

    const sql = `UPDATE grades SET grades = ? WHERE course_id = ? AND student_number = ?`;

    console.log("SQL Query:", sql);
    console.log("SQL Parameters:", [updatedGrades, course_id, studentNumber]);

    pool.query(sql, [updatedGrades, course_id, studentNumber], (err) => {
      if (err) {
        console.error("Error updating grades:", err);
        res.status(500).json({
          error: "Internal server error",
          details: err.message,
        });
      } else {
        const selectSql = `SELECT * FROM grades WHERE course_code = ? AND student_number = ?`;

        console.log("SELECT SQL Query:", selectSql);
        console.log("SELECT SQL Parameters:", [course_id, studentNumber]);

        pool.query(
          selectSql,
          [course_id, studentNumber],
          (selectErr, result) => {
            if (selectErr) {
              console.error("Error retrieving updated grades:", selectErr);
              res.status(500).json({
                error: "Internal server error",
                details: selectErr.message,
              });
            } else {
              if (result.length === 1) {
                const updatedGradesData = {
                  courseCode: result[0].course_code,
                  grades: result[0].grades,
                  studentNumber: result[0].student_number,
                };
                console.log("Updated Grades Data:", updatedGradesData);
                res.status(200).json(updatedGradesData);
              } else {
                res.status(404).json({ error: "Grades not found" });
              }
            }
          }
        );
      }
    });
  } catch (error) {
    console.error("Error updating grades:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default router;
