import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js"; 

dotenv.config();

const router = express.Router();

router.get("/students", async (req, res) => {
  try {
    console.log("Received GET request to /students");

    const studentNumber = req.query.studentNumber;
    console.log("Received student number:", studentNumber);

    if (!studentNumber) {
      throw new Error("Student number is missing");
    }

    console.log(
      `Received GET request to /students with student number: ${studentNumber}`
    );

    // Validate the student number format using a regular expression
    const studentNumberPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
    if (!studentNumber.match(studentNumberPattern)) {
      throw new Error("Invalid student number format");
    }

    // Construct a SQL query to select the student data for the given student number
    const q = "SELECT * FROM students WHERE student_number = ?";

    // Execute the SQL query with the provided student number as a parameter
    const [data] = await pool.query(q, [studentNumber]);

    console.log("SQL Query:", q);
    console.log("SQL Query Parameters:", [studentNumber]);
    console.log("Query Result:", data);

    if (data.length === 0) {
      throw new Error("Student not found");
    }

    return res.json(data[0]); // Assuming there should be only one matching student
  } catch (error) {
    console.error("Error processing /students request:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/students/all", async (req, res) => {
  try {
    console.log("Received GET request to /students/all");

    const q = "SELECT * FROM students";

    const [data] = await pool.query(q);

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    return res.json(data); // Return all student data
  } catch (error) {
    console.error("Error processing /students/all request:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/students/program/:program_id", async (req, res) => {
  try {
    console.log("Received GET request to /students/program");

    const program_id = req.params.program_id;
    const q = "SELECT * FROM students WHERE program_id = ?";

    const [data] = await pool.query(q, [program_id]);

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    return res.json(data); // Return all student data with the specified program_id
  } catch (error) {
    console.error("Error processing /students/program request:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/students/password/:studentNumber", async (req, res) => {
  try {
    const studentNumber = req.params.studentNumber;

    // Validate the student number format using a regular expression
    const studentNumberPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
    if (!studentNumber.match(studentNumberPattern)) {
      throw new Error("Invalid student number format");
    }

    // Construct a SQL query to select the student password for the given student number
    const q = "SELECT student_password FROM students WHERE student_number = ?";

    // Execute the SQL query with the provided student number as a parameter
    const [data] = await pool.query(q, [studentNumber]);

    if (data.length === 0) {
      throw new Error("Student not found");
    }

    return res.json({ student_password: data[0].student_password });
  } catch (error) {
    console.error(
      "Error processing /students/password request:",
      error.message
    );
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});
router.get("/students/:studentNumber", async (req, res) => {
  try {
    const studentNumber = req.params.studentNumber;

    // Validate the student number format using a regular expression
    const studentNumberPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
    if (!studentNumber.match(studentNumberPattern)) {
      throw new Error("Invalid student number format");
    }

    // Construct a SQL query to select the student data for the given student number
    const q = "SELECT * FROM students WHERE student_number = ?";

    // Execute the SQL query with the provided student number as a parameter
    const [data] = await pool.query(q, [studentNumber]);

    if (data.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    return res.json(data[0]); // Assuming there should be only one matching student
  } catch (error) {
    console.error(
      "Error processing /students/:studentNumber request:",
      error.message
    );
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});


export default router;
