import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();


router.post("/evaluate", async (req, res) => {
  const q =
    "INSERT INTO evaluate(course_reco, evalcredit_unit, requiredcredit_unit, faculty_id, student_number,date_eval, eval_year, eval_sem) VALUES (?, ?, ?, ?,?, ?, ?,?)";
  const values = [
    req.body.course_reco,
    req.body.evalcredit_unit,
    req.body.requiredcredit_unit,
    req.body.faculty_id,
    req.body.student_number,
    req.body.date_eval,
    req.body.eval_year,

    req.body.eval_sem,
  ];

  try {
    const insertEvaluate = () => {
      return new Promise((resolve, reject) => {
        pool.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await insertEvaluate();

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


export default router;
