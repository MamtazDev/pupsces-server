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
  const facultyId = req.params.facultyId;

  // Format the birthdate value in 'YYYY-MM-DD' format
  const formattedBirthdate = new Date(req.body.birthdate)
    .toISOString()
    .split("T")[0];

  // Construct a SQL query to update faculty data
  const q =
    "UPDATE faculty SET gender=?, birthdate=?, program_id=? WHERE faculty_id=?";

  const values = [
    req.body.gender,
    formattedBirthdate, // Use the formattedBirthdate variable
    req.body.program_id,
    facultyId,
  ];

  const updateFaculty = async () => {
    try {
      const [result] = await pool.query(q, values);
      return result;
    } catch (error) {
      throw error;
    }
  };

  try {
    const updatedData = await updateFaculty();

    console.log("Data updated successfully");
    // Output only the data
    console.log("Updated Data:", updatedData);

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error during update:", error.message);
    res.status(500).json({
      error: "An error occurred while updating the faculty",
      details: error.message,
    });
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
