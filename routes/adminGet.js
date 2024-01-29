import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.get("/admin", (req, res) => {
  try {
    console.log("Received GET request to /admin");

    const q = "SELECT * FROM admin";

    pool.query(q, (err, data) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      console.log("SQL Query:", q);
      console.log("Query Result:", data);

      return res.json(data); // Return all admin data
    });
  } catch (error) {
    console.error("Error in /admin route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/:email", (req, res) => {
  try {
    const email = req.params.email;
    console.log("Received email parameter:", email);

    const q = "SELECT * FROM admin WHERE admin_email = ?";

    pool.query(q, [email], (err, data) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      console.log("Query result:", data);

      if (data.length === 0) {
        console.log("No data found for admin email:", email);
        return res.status(404).json({ message: "Admin not found" });
      }

      return res.json(data[0]);
    });
  } catch (error) {
    console.error("Error in /admin/:email route:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});

export default router;
