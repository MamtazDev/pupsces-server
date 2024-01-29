import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.get("/faculty/password/:facultyEmail", async (req, res) => {
  try {
    const facultyEmail = req.params.facultyEmail;
    const q = "SELECT faculty_password FROM faculty WHERE email = ?";
    const [data] = await pool.query(q, [facultyEmail]);

    if (data.length === 0) {
      console.log("No data found for faculty email:", facultyEmail);
      return res.status(404).json({ message: "Faculty not found" });
    }

    return res.json({ faculty_password: data[0].faculty_password });
  } catch (error) {
    console.error("Error in faculty password route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/faculty/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const q = "SELECT * FROM faculty WHERE email = ?";
    const [data] = await pool.query(q, [email]);

    if (data.length === 0) {
      console.log("No data found for faculty email:", email);
      return res.status(404).json({ message: "Faculty not found" });
    }

    return res.json(data[0]);
  } catch (error) {
    console.error("Error in faculty route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/faculty", async (req, res) => {
  try {
    const q = "SELECT * FROM faculty";
    const [data] = await pool.query(q);
    return res.json(data);
  } catch (error) {
    console.error("Error in faculty list route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/facultyId/:facultyId", async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    const q = "SELECT * FROM faculty WHERE faculty_id = ?";
    const [data] = await pool.query(q, [facultyId]);

    if (data.length === 0) {
      console.log("No data found for facultyId:", facultyId);
      return res.status(404).json({ error: "Faculty not found" });
    }

    console.log("Result:", data[0]); // Log the result to check
    return res.json(data[0]); // Assuming you expect a single faculty record
  } catch (error) {
    console.error("Error in faculty ID route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
