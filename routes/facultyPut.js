import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.put("/updatefaculty/:email", (req, res) => {
  const email = req.params.email;
  const updatedFacultyData = req.body;
  console.log("Received PUT request for email:", email);
  console.log("Updated Faculty Data:", updatedFacultyData);

  const updateQuery =
    "UPDATE faculty SET faculty_id=?, faculty_fname=?, faculty_mname=?, faculty_lname=?, gender=?, birthdate=?, program_id=? WHERE email=?";
  const values = [
    updatedFacultyData.faculty_id,
    updatedFacultyData.faculty_fname,
    updatedFacultyData.faculty_mname,
    updatedFacultyData.faculty_lname,
    updatedFacultyData.gender,
    updatedFacultyData.birthdate,
    updatedFacultyData.program_id,
    email,
  ];

  pool.query(updateQuery, values, (updateErr, updateResult) => {
    if (updateErr) {
      console.error("Error updating the database:", updateErr);
      return res.status(500).json({
        error: "Internal server error",
        details: updateErr.message,
      });
    }

    console.log("Update Query:", updateQuery);
    console.log("Update Query Parameters:", values);
    console.log("Update Result:", updateResult);

    if (updateResult.affectedRows > 0) {
      return res.json({ message: "Faculty updated successfully" });
    } else {
      return res.status(404).json({ message: "Faculty not found" });
    }
  });
});

router.put("/faculty/:facultyId", async (req, res) => {
  const facultyId = req.params.facultyId;
  const updatedFacultyData = req.body;

  const q =
    "UPDATE analysis SET faculty_fname=?, faculty_mname=?, faculty_lname=?, gender=?, birthdate=?, email=?, faculty_password=?, program_id=? WHERE faculty_id=?";
  const values = [
    updatedFacultyData.faculty_fname,
    updatedFacultyData.faculty_mname,
    updatedFacultyData.faculty_lname,
    updatedFacultyData.gender,
    updatedFacultyData.birthdate,
    updatedFacultyData.email,
    updatedFacultyData.faculty_password,
    updatedFacultyData.program_id,
    facultyId,
  ];

  try {
    const [result] = await pool.query(q, values);
    console.log("Data updated successfully");
    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data in the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
