import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.put("/updatefaculty/:email", async (req, res) => {
  const email = req.params.email;
  const updatedFacultyData = req.body;
  console.log("Received PUT request for email:", email);
  console.log("Updated Faculty Data:", updatedFacultyData);

  const connection = await pool.getConnection();

  try {
    // Start a transaction
    await connection.beginTransaction();

   const updateQuery =
     "UPDATE faculty SET faculty_fname=?, faculty_mname=?, faculty_lname=?, gender=?, birthdate=?, email=?, program_id=? WHERE email=?";
   const values = [
     updatedFacultyData.faculty_fname,
     updatedFacultyData.faculty_mname,
     updatedFacultyData.faculty_lname,
     updatedFacultyData.gender,
     updatedFacultyData.birthdate,
     updatedFacultyData.email, // Assuming email is part of the updated data
     updatedFacultyData.program_id,
     email,
   ];

  

    // Execute the update query
    const [updateResult] = await connection.query(updateQuery, values);

    // Commit the transaction
    await connection.commit();

    console.log("Update Query:", updateQuery);
    console.log("Update Query Parameters:", values);
    console.log("Update Result:", updateResult);

    if (updateResult.affectedRows > 0) {
      return res.json({ message: "Faculty updated successfully" });
    } else {
      return res.status(404).json({ message: "Faculty not found" });
    }
  } catch (updateErr) {
    // Rollback the transaction in case of an error
    await connection.rollback();

    console.error("Error updating the database:", updateErr);
    return res.status(500).json({
      error: "Internal server error",
      details: updateErr.message,
    });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
});


router.put("/updatefacultypassword/:email", async (req, res) => {
  const email = req.params.email;
  const updatedFacultyData = req.body;
  console.log("Received PUT request for email:", email);
  console.log("Updated Faculty Data:", updatedFacultyData);

  const connection = await pool.getConnection();

  try {
    // Start a transaction
    await connection.beginTransaction();

    const updateQuery = "UPDATE faculty SET  faculty_password= ? WHERE email=?";
    const values = [updatedFacultyData.faculty_password, email];

    // Execute the update query
    const [updateResult] = await connection.query(updateQuery, values);

    // Commit the transaction
    await connection.commit();

    console.log("Update Query:", updateQuery);
    console.log("Update Query Parameters:", values);
    console.log("Update Result:", updateResult);

    if (updateResult.affectedRows > 0) {
      return res.json({ message: "Faculty updated successfully" });
    } else {
      return res.status(404).json({ message: "Faculty not found" });
    }
  } catch (updateErr) {
    // Rollback the transaction in case of an error
    await connection.rollback();

    console.error("Error updating the database:", updateErr);
    return res.status(500).json({
      error: "Internal server error",
      details: updateErr.message,
    });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
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
