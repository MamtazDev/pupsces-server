import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/grades", async (req, res) => {
  const q = `INSERT INTO grades (student_number, course_id, grades, remarks) VALUES (?,?,?,?)`;
  const values = [
    req.body.student_number,
    req.body.course_id,
    req.body.grades,
    req.body.remarks,
  ];

  try {
    const insertGrades = async () => {
      return new Promise((resolve, reject) => {
        pool.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await insertGrades();

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
