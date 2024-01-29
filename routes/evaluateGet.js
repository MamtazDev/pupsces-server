import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();


router.get("/evaluate", async (req, res) => {
  try {
    console.log("Received GET request to /evaluate");

    const q = "SELECT * FROM evaluate";
    const [data] = await pool.query(q);

    return res.json(data);
  } catch (error) {
    console.error("Error in /evaluate route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/evaluate-student", async (req, res) => {
  try {
    console.log("Received GET request to /evaluate");

    const studentNumber = req.query.student_number;

    if (!studentNumber) {
      return res.status(400).json({ error: "Student number is required" });
    }

    const q = "SELECT * FROM evaluate WHERE student_number = ?";
    const [data] = await pool.query(q, [studentNumber]);

    return res.json(data);
  } catch (error) {
    console.error("Error in /evaluate-student route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});


router.get("/evaluate-faculty", async (req, res) => {
  try {
    console.log("Received GET request to /evaluate-faculty");

    const faculty_id = req.query.faculty_id;

    if (!faculty_id) {
      return res.status(400).json({ error: "Faculty Id is required" });
    }

    const q = "SELECT * FROM evaluate WHERE faculty_id = ?";
    const [data] = await pool.query(q, [faculty_id]);

    return res.json(data);
  } catch (error) {
    console.error("Error in /evaluate-faculty route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/evaluate-recommend", async (req, res) => {
  try {
    console.log("Received GET request to /evaluate-recommend");

    const studentNumber = req.query.student_number;
    const year = req.query.eval_year;
    const semester = req.query.eval_sem;

    const q =
      "SELECT * FROM evaluate WHERE student_number = ? AND eval_year = ? AND eval_sem = ?";
    const [data] = await pool.query(q, [studentNumber, year, semester]);

    return res.json(data);
  } catch (error) {
    console.error("Error in /evaluate-recommend route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/evaluate-get", async (req, res) => {
  try {
    const courseCode = req.query.course_reco;

    const q = "SELECT date_eval FROM evaluate WHERE course_reco = ?";
    const [data] = await pool.query(q, [courseCode]);

    if (data.length > 0) {
      const dateEval = data[0].date_eval;
      return res.json({ date_eval: dateEval });
    } else {
      return res.status(404).json({ error: "Course code not found" });
    }
  } catch (error) {
    console.error("Error in /evaluate-get route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/evaluate-units", async (req, res) => {
  try {
    const eval_year = req.query.eval_year;
    const eval_sem = req.query.eval_sem;
    const student_number = req.query.student_number;
    console.log("Received GET request to /evaluate-units");

    const q =
      "SELECT SUM(evalcredit_unit) AS totalEvalCredit FROM evaluate WHERE eval_year = ? AND eval_sem = ? AND student_number = ?";
    const [data] = await pool.query(q, [eval_year, eval_sem, student_number]);

    const totalEvalCredit = data[0].totalEvalCredit;

    return res.json({ totalEvalCredit });
  } catch (error) {
    console.error("Error in /evaluate-units route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
