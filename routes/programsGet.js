// programsGet.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

async function fetchProgramsFromDatabase() {
  try {
    const [programs] = await pool.query("SELECT * FROM programs");
    return programs;
  } catch (error) {
    console.error("Error fetching programs from the database: ", error);
    throw new Error("Error fetching programs from the database.");
  }
}

router.get("/programs", async (req, res) => {
  console.log("Received GET request to /programs");

  try {
    const programs = await fetchProgramsFromDatabase();
    return res.json(programs);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

export default router;
