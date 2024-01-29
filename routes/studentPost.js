import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/students", async (req, res) => {
  const q =
    "INSERT INTO students (`student_number`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `status`, `email`, `school_year`,  `program_id`, `strand`) VALUES(?)";
  const values = [
    req.body.student_number,
    req.body.first_name,
    req.body.middle_name,
    req.body.last_name,
    req.body.gender,
    req.body.birthdate,
    req.body.status,
    req.body.email,
    req.body.school_year,
    req.body.program_id,
    req.body.strand,
  ];

  try {
    const insertStudent = async () => {
      return new Promise((resolve, reject) => {
        pool.query(q, [values], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    };

    const result = await insertStudent();

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error during user signin:", error.message);
    res
      .status(500)
      .json({
        error: "An error occurred while signing the user",
        details: error.message,
      });
  }
});

router.post("/students/:studentNumber", async (req, res) => {
  const studentNumber = req.params.studentNumber;

  const q =
    "UPDATE students SET  `gender`=?,  `status`=?,  `school_year`=?,  `program_id`=?, `strand`=? WHERE `student_number`=?";
  const values = [
    req.body.gender,
    req.body.status,
    req.body.school_year,
    req.body.program_id,
    req.body.strand,
    studentNumber,
  ];

  try {
    const updateStudent = async () => {
      return new Promise((resolve, reject) => {
        pool.query(q, values, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    };

    const result = await updateStudent();
    console.log("Update Result:", result);

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error during update:", error.message);
    res
      .status(500)
      .json({
        error: "An error occurred while updating the student",
        details: error.message,
      });
  }
});

export default router;
