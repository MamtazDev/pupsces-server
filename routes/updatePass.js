import express from "express";
import dotenv from "dotenv";
import { pool as db } from "../db.js"; // Assuming the db connection pool is exported from "../db.js"

dotenv.config();

const router = express.Router();

router.post("/updatePassword", async (req, res) => {
  try {
    const { student_number, student_password } = req.body;

    console.log(
      "Received request to update password for student number:",
      student_number
    );
    console.log("New password:", student_password);

    const sql =
      "UPDATE students SET student_password = ? WHERE student_number = ?";

    await db.query(sql, [student_password, student_number]);

    console.log(
      "Password updated successfully for student number:",
      student_number
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/facultyupdatePassword", async (req, res) => {
  try {
    const { faculty_id, faculty_password } = req.body;

    console.log(
      "Received request to update password for faculty ID:",
      faculty_id
    );
    console.log("New password:", faculty_password);

    const sql = "UPDATE faculty SET faculty_password = ? WHERE faculty_id = ?";

    await db.query(sql, [faculty_password, faculty_id]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/adminupdatePassword", async (req, res) => {
  try {
    const { admin_email, admin_password } = req.body;

    console.log(
      "Received request to update password for admin email:",
      admin_email
    );
    console.log("New password:", admin_password);

    const sql = "UPDATE admin SET admin_password = ? WHERE admin_email = ?";

    await db.query(sql, [admin_password, admin_email]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
