import dotenv from "dotenv";
import express from "express";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.put("/updateadmin", async (req, res) => {
  try {
    const updatedAdminData = req.body;

    const updateQuery = "UPDATE admin SET ?";

    pool.query(updateQuery, [updatedAdminData], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating the database:", updateErr);
        return res.status(500).json({
          error: "Internal server error",
          details: updateErr.message,
        });
      }

      console.log("Update Query:", updateQuery);
      console.log("Update Result:", updateResult);

      if (updateResult.affectedRows > 0) {
        return res.json({ message: "Admin updated successfully" });
      } else {
        return res.status(404).json({ message: "Admin not found" });
      }
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;
