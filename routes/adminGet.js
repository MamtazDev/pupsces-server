import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.get("/admin", async (req, res) => {
  try {
    console.log("Received GET request to /admin");

    const q = "SELECT * FROM admin";

    try {
      const data = await pool.query(q);

      console.log("SQL Query:", q);
      console.log("Query Result:", data);

      return res.json(data); // Return all admin data
    } catch (error) {
      console.error("Error querying the database:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error in /admin route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/admin/:email", async (req, res) => {
  try {
    const email = req.params.email;
    console.log("Received email parameter:", email);

    const q = "SELECT * FROM admin WHERE admin_email = ?";

    try {
      const data = await pool.query(q, [email]);

      console.log("Query result:", data);

      if (data.length === 0) {
        console.log("No data found for admin email:", email);
        return res.status(404).json({ message: "Admin not found" });
      }

      return res.json(data[0]);
    } catch (error) {
      console.error("Error querying the database:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error in /admin/:email route:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});


export default router;
