import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();


app.delete("/grades/:studentNumber/:courseId", (req, res) => {
  const studentNumber = req.params.studentNumber;
  const courseId = req.params.courseId;

  const sql = "DELETE FROM grades WHERE student_number = ? AND course_id = ?";
  console.log("Received studentNumber:", studentNumber);
  console.log("Received courseId:", courseId);

  db.query(sql, [studentNumber, courseId], (err, result) => {
    if (err) {
      console.error("Error deleting grades:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Grades deleted successfully" });
      } else {
        res.status(404).json({ message: "Grades not found" });
      }
    }
  });
});
