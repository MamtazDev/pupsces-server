import express from "express";
import { pool } from "../db.js";

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

    // Check for existing entry
    const selectSql = `SELECT * FROM grades WHERE student_number = ? AND course_id = ?`;
    const selectValues = [studentNumber, course_id];

    const [selectResult, selectFields] = await pool.execute(
      selectSql,
      selectValues
    );
    console.log("Select SQL:", selectSql);
    console.log("Select Values:", selectValues);

    if (selectResult.length > 0) {
      // Update existing entry
      const updateSql = `UPDATE grades SET grades = ?, remarks = ? WHERE student_number = ? AND course_id = ?`;
      const updateValues = [grades, remarks, studentNumber, course_id];

      console.log("Update SQL:", updateSql);
      console.log("Update Values:", updateValues);

      await pool.execute(updateSql, updateValues);
      console.log("Grades updated successfully");
      return res.status(200).json({ message: "Grades updated successfully" });
    } else {
      // Insert new entry
      const insertSql = `INSERT INTO grades (student_number, course_id, grades, remarks) VALUES (?, ?, ?, ?)`;
      const insertValues = [studentNumber, course_id, grades, remarks];
      console.log("Insert SQL:", insertSql);
      console.log("Insert Values:", insertValues);

      await pool.execute(insertSql, insertValues);
      console.log("New grades inserted successfully");
      return res
        .status(200)
        .json({ message: "New grades inserted successfully" });
    }
  } catch (error) {
    console.error("Error updating/inserting grades:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.put("/grades/:studentNumber/:courseCode", async (req, res) => {
  try {
    const courseCode = req.params.courseCode;
    const studentNumber = req.params.studentNumber;
    const updatedGrades = req.body.grades;

    console.log("PUT request received for studentNumber:", studentNumber);
    console.log("Course Code:", courseCode);
    console.log("Updated Grades:", updatedGrades);

    const updateSql =
      "UPDATE grades SET grades = ? WHERE course_code = ? AND student_number = ?";
    const selectSql =
      "SELECT * FROM grades WHERE course_code = ? AND student_number = ?";

    console.log("UPDATE SQL Query:", updateSql);
    console.log("UPDATE SQL Parameters:", [
      updatedGrades,
      courseCode,
      studentNumber,
    ]);

    // Execute the update query
    await pool.query(updateSql, [updatedGrades, courseCode, studentNumber]);

    console.log("SELECT SQL Query:", selectSql);
    console.log("SELECT SQL Parameters:", [courseCode, studentNumber]);

    // Retrieve the updated grades
    const [result] = await pool.query(selectSql, [courseCode, studentNumber]);

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
  } catch (error) {
    console.error("Error updating grades:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default router;
