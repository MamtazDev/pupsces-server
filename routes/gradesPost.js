import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const app = express.Router();

app.post("/grades", async (req, res) => {
  console.log("Received POST request to /grades");
  const q = `INSERT INTO grades (student_number, course_id, grades, remarks) VALUES (?,?,?,?)`;
  const values = [
    req.body.student_number,
    req.body.course_id,
    req.body.grades,
    req.body.remarks,
  ];

  const insertGrades = async () => {
    try {
      const [result] = await pool.query(q, values);
      return result;
    } catch (error) {
      throw error;
    }
  };

  try {
    const insertedData = await insertGrades();

    console.log("Data inserted successfully");
    // Output only the data
    console.log("Inserted Data:", insertedData);

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
