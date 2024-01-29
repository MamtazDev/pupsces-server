import express from "express";
import dotenv from "dotenv";
import {pool} from "./../db.js"

dotenv.config();

const router = express.Router();


router.post("/checkEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const [result] = await pool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );

    if (result.length > 0) {
      const { first_name, last_name, student_number } = result[0];
      res
        .status(200)
        .json({ exists: true, first_name, last_name, student_number });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/facultycheckEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const [result] = await pool.query("SELECT * FROM faculty WHERE email = ?", [
      email,
    ]);

    if (result.length > 0) {
      const { faculty_fname, faculty_lname, faculty_id } = result[0];
      res
        .status(200)
        .json({ exists: true, faculty_fname, faculty_lname, faculty_id });
      console.log(faculty_fname, faculty_lname, faculty_id);
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admincheckEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const [result] = await pool.query(
      "SELECT * FROM admin WHERE admin_email = ?",
      [email]
    );

    if (result.length > 0) {
      const { admin_email } = result[0];
      res.status(200).json({ exists: true, admin_email });
      console.log(admin_email);
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;