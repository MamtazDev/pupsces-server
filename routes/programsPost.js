import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/programs", async (req, res) => {
  const q = "INSERT INTO programs (`program_name`) VALUES(?)";
  const values = [req.body.program_name];

  try {
    const insertProgram = async () => {
      return new Promise((resolve, reject) => {
        pool.query(q, [values], (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    const result = await insertProgram();
    res.json(result);
  } catch (error) {
    console.error("Error during program creation:", error.message);
    res
      .status(500)
      .json({
        error: "An error occurred while creating the program",
        details: error.message,
      });
  }
});

router.post("/program", (req, res) => {
  console.log("Received POST request to /programs");

  const { program_abbr, program_name } = req.body;

  if (!program_abbr || !program_name) {
    return res
      .status(400)
      .json({ error: "Both program_abbr and program_name are required." });
  }

  const q = `INSERT INTO programs (program_abbr, program_name) VALUES (?, ?)`;
  const values = [program_abbr, program_name];

  try {
    pool.query(q, values, (err, result) => {
      if (err) throw err;

      const newProgramId = result.insertId;
      const selectQuery = `SELECT * FROM programs WHERE program_id = ?`;

      pool.query(selectQuery, [newProgramId], (selectErr, selectData) => {
        if (selectErr) throw selectErr;

        res.status(201).json(selectData[0]);
      });
    });
  } catch (error) {
    console.error("Error during program creation:", error.message);
    res
      .status(500)
      .json({
        error: "An error occurred while creating the program",
        details: error.message,
      });
  }
});

export default router;
