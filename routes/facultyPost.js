import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/faculty", async (req, res) => {
  try {
    const formattedBirthdate = new Date(req.body.birthdate)
      .toISOString()
      .split("T")[0];

    const q =
      "INSERT INTO faculty(`faculty_id`,`faculty_fname`,`faculty_mname`, `faculty_lname`, `gender`, `birthdate`, `email`, `faculty_password`) VALUES(?,?,?,?,?,?,?,?)";

    const values = [
      req.body.faculty_id,
      req.body.faculty_fname,
      req.body.faculty_mname,
      req.body.faculty_lname,
      req.body.gender,
      formattedBirthdate,
      req.body.email,
      req.body.faculty_password,
    ];

    await executeQuery(q, values);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/faculty/:facultyId", async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    const { gender, birthdate, program_id } = req.body;

    // Validate faculty ID and other data here

    // Format the birthdate value in 'YYYY-MM-DD' format
    const formattedBirthdate = new Date(birthdate).toISOString().split("T")[0];

    // Construct a SQL query to update faculty data
    const q =
      "UPDATE faculty SET gender=?, birthdate=?, program_id=? WHERE faculty_id=?";

    // Execute the SQL query with the provided parameters
    await executeQuery(q, [gender, formattedBirthdate, program_id, facultyId]);

    res.status(200).json({ message: "Faculty data updated successfully" });
  } catch (error) {
    console.error("Error during update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    pool.query(query, values, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export default router;
