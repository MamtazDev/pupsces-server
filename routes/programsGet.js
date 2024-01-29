// programsGet.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/programs", async (req, res) => {
  console.log("Received GET request to /programs");

  try {
    const [programs] = await pool.query("SELECT * FROM programs");
    return res.json(programs);
  } catch (error) {
    console.error("Error fetching programs from the database: ", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
