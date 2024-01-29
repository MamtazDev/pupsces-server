import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.put("/students/update-status/:studentNumber", async (req, res) => {
  console.log("Received PUT request to /students/update-status/:studentNumber");

  const { studentNumber } = req.params;
  const { newStatus } = req.body;

  const q = "UPDATE students SET status = ? WHERE student_number = ?";

  try {
    const data = await pool.query(q, [newStatus, studentNumber]);

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    if (data.affectedRows > 0) {
      return res.json({ message: "Student status updated successfully" });
    } else {
      return res.status(404).json({ error: "Student not found" });
    }
  } catch (err) {
    console.error("Error updating student status in the database:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/students/:studentNumber", async (req, res) => {
  console.log("Received PUT request to /students");

  const studentNumber = req.params.studentNumber;
  console.log("Received student number:", studentNumber);

  // Assuming you have a request body with the updated student information
  const updatedStudentData = req.body;
  console.log("Received updated student data:", updatedStudentData);

  // If the student does not exist, insert a new student
  const insertQuery =
    "INSERT INTO students (`student_number`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `status`, `email`, `school_year`,  `program_id`, `strand`) VALUES (?)";
  const insertValues = [
    updatedStudentData.student_number,
    updatedStudentData.first_name,
    updatedStudentData.middle_name,
    updatedStudentData.last_name,
    updatedStudentData.gender,
    updatedStudentData.birthdate,
    updatedStudentData.status,
    updatedStudentData.email,
    updatedStudentData.school_year,
    updatedStudentData.program_id,
    updatedStudentData.strand,
  ];

  try {
    const insertResult = await pool.query(insertQuery, [insertValues]);

    console.log("Insert Query:", insertQuery);
    console.log("Insert Query Parameters:", [insertValues]);
    console.log("Insert Result:", insertResult);

    // Check if the student was inserted (affectedRows is greater than 0)
    if (insertResult.affectedRows > 0) {
      return res.json({ message: "Student inserted successfully" });
    }

    // If the student exists, update the existing student
    const updateQuery = "UPDATE students SET ? WHERE student_number = ?";
    // Execute the SQL query with the updated student data and student number as parameters
    const updateResult = await pool.query(updateQuery, [
      updatedStudentData,
      studentNumber,
    ]);

    console.log("Update Query:", updateQuery);
    console.log("Update Query Parameters:", [
      updatedStudentData,
      studentNumber,
    ]);
    console.log("Update Result:", updateResult);

    // Check if the student was updated (affectedRows is greater than 0)
    if (updateResult.affectedRows > 0) {
      // If the update is successful, also fetch the updated student data
      const selectQuery = "SELECT * FROM students WHERE student_number = ?";
      // Execute the SQL query to select the updated student data
      const selectResult = await db.query(selectQuery, [studentNumber]);

      console.log("Select Query:", selectQuery);
      console.log("Select Query Parameters:", [studentNumber]);
      console.log("Select Result:", selectResult);

      // Check if the student was found
      if (selectResult.length > 0) {
        return res.json({
          message: "Student updated successfully",
          updatedStudent: selectResult[0],
        });
      }

      return res.status(404).json({ message: "Student not found" });
    } else {
      // If the student neither exists nor was inserted, return an error
      return res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    console.error("Error updating/inserting student in the database:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updatestudents/:studentNumber", async (req, res) => {
  const studentNumber = req.params.studentNumber;
  const updatedStudentData = req.body;

  const updateQuery = "UPDATE students SET ? WHERE student_number = ?";

  try {
    const updateResult = await pool.query(updateQuery, [
      updatedStudentData,
      studentNumber,
    ]);

    console.log("Update Query:", updateQuery);
    console.log("Update Query Parameters:", [
      updatedStudentData,
      studentNumber,
    ]);
    console.log("Update Result:", updateResult);

    if (updateResult.affectedRows > 0) {
      return res.json({ message: "Student updated successfully" });
    } else {
      return res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    console.error("Error updating the database:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
