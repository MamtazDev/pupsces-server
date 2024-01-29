import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";


dotenv.config();

const router = express.Router();

function verifyToken(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.headers.authorization;

  try {
    const decodedToken = jwt.verify(token, jwtSecret);

    if (decodedToken.role === "student" || decodedToken.role === "faculty") {
      req.decodedToken = decodedToken;
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token is invalid" });
  }
}

router.get("/protected-route", verifyToken, (req, res) => {
  const userId = req.decodedToken.userId;
  res.json({ message: `Authenticated user with ID: ${userId}` });
});

router.get("/student-protected-route", verifyToken, (req, res) => {
  const studentNumber = req.decodedToken.student_number;
  res.json({
    message: `Authenticated student with student number: ${studentNumber}`,
  });
});

router.get("/faculty-protected-route", verifyToken, (req, res) => {
  const facultyId = req.decodedToken.faculty_id;
  res.json({ message: `Authenticated faculty with faculty ID: ${facultyId}` });
});

function protectStudentRoute(req, res, next) {
  try {
    if (req.user && req.user.role === "student") {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

function protectFacultyRoute(req, res, next) {
  try {
    if (req.user && req.user.role === "faculty") {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Dashboard routes with try-catch blocks
router.get("/student/dashboard", protectStudentRoute, (req, res) => {
  try {
    res.json({ message: "Welcome to the student dashboard" });
  } catch (error) {
    console.error("Error in student dashboard route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/faculty/dashboard", protectFacultyRoute, (req, res) => {
  try {
    res.json({ message: "Welcome to the faculty dashboard" });
  } catch (error) {
    console.error("Error in faculty dashboard route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
