import express from "express";
import util from "util";
import { pool } from "../db.js";

const router = express.Router();
const queryAsync = pool.query.bind(pool);


const insertEvaluate = async (values) => {
  const q =
    "INSERT INTO evaluate(course_reco, evalcredit_unit, requiredcredit_unit, faculty_id, student_number, date_eval, eval_year, eval_sem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const [result] = await queryAsync(q, values);
    return result;
  } catch (error) {
    throw error;
  }
};

router.post("/evaluate", async (req, res) => {
  try {
    const {
      course_reco,
      evalcredit_unit,
      requiredcredit_unit,
      faculty_id,
      student_number,
      date_eval,
      eval_year,
      eval_sem,
    } = req.body;

    const values = [
      course_reco,
      evalcredit_unit,
      requiredcredit_unit,
      faculty_id,
      student_number,
      date_eval,
      eval_year,
      eval_sem,
    ];

    await insertEvaluate(values);

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
