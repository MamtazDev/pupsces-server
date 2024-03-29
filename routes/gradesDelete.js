import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.delete("/grades/:studentNumber/:courseId", async (req, res) => {
  const studentNumber = req.params.studentNumber;
  const courseId = req.params.courseId;
  try {
    console.log("Received studentNumber:", studentNumber);
    console.log("Received courseId:", courseId);

    // Validate input parameters
    if (!studentNumber || !courseId) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const sql = "DELETE FROM grades WHERE student_number = ? AND course_id = ?";
    console.log("Received studentNumber:", studentNumber);
    console.log("Received courseId:", courseId);

    try {
      const result = await pool.query(sql, [studentNumber, courseId]);

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Grades deleted successfully" });
      } else {
        console.log(
          `Grades not found for studentNumber: ${studentNumber}, courseId: ${courseId}`
        );
        res.status(404).json({ message: "Grades not found" });
      }
    } catch (error) {
      console.error("Error deleting grades:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error in /grades/:studentNumber/:courseId route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
