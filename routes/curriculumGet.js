import express from "express";
import { pool } from "../db.js";

const router = express.Router();

const executeQuery = (res, q, params, callback) => {
  console.log("Executing query:", q);
  console.log("Before executing query");
  pool.query(q, params, (err, data) => {
    console.log("Inside callback after executing query");
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    }

    console.log("Query result:", data);
    if (callback) {
      // If a callback is provided, invoke it with the data
      callback(data);
    } else {
      // If no callback, simply send the response
      res.json(data);
    }
  });
  console.log("After executing query");
};

router.get("/courses", async (req, res) => {
  console.log("Received GET request to /courses");

  try {
    const [courses] = await pool.query("SELECT * FROM courses");
    return res.json(courses);
  } catch (error) {
    console.error("Error fetching courses from the database: ", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum", async (req, res) => {
  try {
    console.log("Received GET request to /curriculum");

    const program_id = req.query.program_id;
    const year_started = req.query.year_started;

    console.log("req.query:", req.query);
    console.log("program_id:", program_id);
    console.log("year_started:", year_started);

    if (!program_id || !year_started) {
      console.log("program_id in if:", program_id);
      console.log("year_started in if:", year_started);
      return res.status(400).json({
        error:
          "Both program_id and year_started are required in the query parameters.",
      });
    }

    const q = "SELECT * FROM courses WHERE program_id = ? AND year_started = ?";

    try {
      const [courses] = await pool.query(q, [program_id, year_started]);
      return res.json(courses);
    } catch (error) {
      console.error("Error fetching curriculum from the database: ", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  } catch (error) {
    console.error("Error in /curriculum route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});


router.get("/evalcurriculum", (req, res) => {
  try {
    console.log("Received GET request to /evalcurriculum");

    const programId = req.query.program_id;
    const year_started = req.query.year_started;
    const courseCode = req.query.course_code;

    if (!programId || !year_started || !courseCode) {
      return res.status(400).json({
        error:
          "Both program_id, course_type, and course_code are required in the query parameters.",
      });
    }

    const q =
      "SELECT * FROM courses WHERE program_id = ? AND year_started = ? AND course_code = ?";
    executeQuery(res, q, [programId, year_started, courseCode]);
  } catch (error) {
    console.error("Error in /evalcurriculum route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum/all", (req, res) => {
  try {
    const q = "SELECT * FROM courses";
    executeQuery(res, q, []);
  } catch (error) {
    console.error("Error in /curriculum/all route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumyearsem", (req, res) => {
  try {
    const { year, semester } = req.query;
    console.log(
      `Received GET request to /curriculum for year ${year} and semester ${semester}`
    );
    const q = `SELECT * FROM courses WHERE course_year = ? AND course_sem = ?`;
    executeQuery(res, q, [year, semester]);
  } catch (error) {
    console.error("Error in /curriculumyearsem route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum/:courseCode", (req, res) => {
  try {
    const { courseCode } = req.params;
    console.log(`Received GET request for course code ${courseCode}`);
    const q = `SELECT * FROM courses WHERE course_code= ?`;
    pool.query(q, [courseCode], (err, data) => {
      if (err) {
        console.error("Error executing query:", err);
        return res
          .status(500)
          .json({ error: "Internal server error", details: err });
      }
      if (data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ message: "Course not found" });
      }
    });
  } catch (error) {
    console.error("Error in /curriculum/:courseCode route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum-prerequisite", (req, res) => {
  try {
    console.log("Received GET request to /curriculum-prerequisite");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    if (!programId || !year_started) {
      return res.status(400).json({
        error:
          "Both program_id and course_type are required in the query parameters.",
      });
    }

    const q = `
      SELECT course_code, pre_requisite
      FROM courses
      WHERE pre_requisite IS NOT NULL
        AND TRIM(pre_requisite) != ''
        AND year_started = ?
        AND program_id = ?;
    `;

    executeQuery(res, q, [year_started, programId]);
  } catch (error) {
    console.error("Error in /curriculum-prerequisite route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum-prerequisite-codes", (req, res) => {
  try {
    const studentNumber = req.query.studentNumber;

    if (!studentNumber) {
      return res.status(400).json({ error: "StudentNumber is required." });
    }

    const q = `
      SELECT DISTINCT c.course_code, c.pre_requisite
      FROM courses c
      WHERE c.pre_requisite IS NOT NULL
        AND TRIM(c.pre_requisite) != '';
    `;

    executeQuery(res, q, []);
  } catch (error) {
    console.error("Error in /curriculum-prerequisite-codes route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum-prerequisite-codes-grades", (req, res) => {
  try {
    const studentNumber = req.query.studentNumber;
    const q = `
      SELECT DISTINCT c.course_code, c.pre_requisite, g.course_code as pre_req_course, g.grades
      FROM courses c
      INNER JOIN grades g ON c.pre_requisite = g.course_code AND g.student_number = ?
      WHERE (c.pre_requisite IS NOT NULL AND TRIM(c.pre_requisite) != '')
         OR c.course_code IN (
           SELECT DISTINCT pre_requisite FROM courses WHERE pre_requisite IS NOT NULL AND TRIM(pre_requisite) != ''
         );
    `;

    executeQuery(res, q, [studentNumber]);
  } catch (error) {
    console.error(
      "Error in /curriculum-prerequisite-codes-grades route:",
      error
    );
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculum-first-first", (req, res) => {
  try {
    console.log("Received GET request to /curriculum-first-first");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 1 AND course_sem = 'First Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /curriculum-first-first route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumfirst-second", (req, res) => {
  try {
    console.log("Received GET request to /first-second");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 1 AND course_sem = 'Second Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /first-second route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumsecond-first", (req, res) => {
  try {
    console.log("Received GET request to /second-first");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 2 AND course_sem = 'First Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /second-first route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumsecond-second", (req, res) => {
  try {
    console.log("Received GET request to /second-second");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 2 AND course_sem = 'Second Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /second-second route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumthird-first", (req, res) => {
  try {
    console.log("Received GET request to /third-first");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 3 AND course_sem = 'First Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /third-first route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumthird-second", (req, res) => {
  try {
    console.log("Received GET request to /third-second");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
       WHERE program_id = ? AND year_started = ? AND course_year = 3 AND course_sem = 'Second Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /third-second route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumfourth-first", (req, res) => {
  try {
    console.log("Received GET request to /fourth-first");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 4 AND course_sem = 'First Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /fourth-first route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumfourth-second", (req, res) => {
  try {
    console.log("Received GET request to /fourth-second");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_year = 4 AND course_sem = 'Second Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /fourth-second route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/curriculumsummer", (req, res) => {
  try {
    console.log("Received GET request to /fourth-second");
    const programId = req.query.program_id;
    const year_started = req.query.year_started;

    const q = `
      SELECT SUM(credit_unit) as total_credit_units
      FROM courses
      WHERE program_id = ? AND year_started = ? AND course_sem = 'Summer Semester'
    `;

    executeQuery(res, q, [programId, year_started]);
  } catch (error) {
    console.error("Error in /fourth-second route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get(
  "/check-prerequisites/:studentNumber/:courseCode",
  async (req, res) => {
    const studentNumber = req.params.studentNumber;
    const courseCode = req.params.courseCode;

    try {
      // Fetch the prerequisite course for the selected course
      const [prerequisiteResult] = await pool.execute(
        "SELECT pre_requisite FROM courses WHERE course_code = ?",
        [courseCode]
      );

      // If there is no prerequisite, consider prerequisites as met
      if (!prerequisiteResult[0]?.pre_requisite) {
        return res.json({ prerequisitesMet: true });
      }

      const prerequisiteCourseCode = prerequisiteResult[0].pre_requisite;

      // Check if the student has grades for the prerequisite course
      const [grades] = await pool.execute(
        "SELECT grade_id FROM grades WHERE course_code = ? AND student_number = ?",
        [prerequisiteCourseCode, studentNumber]
      );

      // Return the result based on whether grades exist for the prerequisite
      const prerequisitesMet = grades.length > 0;
      res.json({ prerequisitesMet });
    } catch (error) {
      console.error("Error checking prerequisites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/calculate_total_credit_units", (req, res) => {
  // Extract program_id and course_type from the query parameters
  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  if (!programId || !year_started) {
    return res.status(400).json({
      error:
        "Both program_id and course_type are required in the query parameters.",
    });
  }

  const q =
    "SELECT SUM(credit_unit) AS total_credit_units FROM courses WHERE program_id = ? AND year_started = ?";

  // Use a parameterized query to prevent SQL injection

  pool.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json(err);
    }

    if (!data[0]) {
      // Handle the case where no data is returned
      console.error("No data found for the given program and course type.");
      return res.status(404).json({
        error: "No data found for the given program and course type.",
      });
    }

    const totalCreditUnits = data[0].total_credit_units || 0;

    console.log("Total Credit Units:", totalCreditUnits);

    return res.json({ total_credit_units: totalCreditUnits });
  });
});

export default router;
