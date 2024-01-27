import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import mysql from "mysql2";
import nodemailer from "nodemailer";
import xlsx from "xlsx";
import logger from "./logger.mjs";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "P@ssw0rd",
//   database: "dbvisio",
// });

const db = mysql.createConnection({
  host: "us-cluster-east-01.k8s.cleardb.net",
  user: "b49b86da670de7",
  password: "181b139a",
  database: "heroku_4f9f12a2159b680",
});

db.connect(function (err) {
  if (err) {
    console.log("Error in Connection");
  } else {
    console.log("Connected");
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const fileData = req.file.buffer;
    const workbook = xlsx.read(fileData, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const mandatoryColumns = [
      "student_number",
      "first_name",
      "middle_name",
      "last_name",
      "email",
    ];

    console.log(mandatoryColumns);
    const allColumns = [
      "student_number",
      "first_name",
      "middle_name",
      "last_name",
      "gender",
      "birthdate",
      "status",
      "email",
      "school_year",
      "student_password",
      "program_id",
      "strand",
    ];
    const excelToDatabaseColumnMapping = {
      "Student Number": "student_number",
      "First Name": "first_name",
      "Middle Name": "middle_name",
      "Last Name": "last_name",
      gender: "gender",
      email: "email", // This maps 'Email' to 'email'
      // Add other mappings as needed
    };

    const includedColumns = allColumns.filter((column) =>
      // eslint-disable-next-line no-prototype-builtins
      data.every((row) => row.hasOwnProperty(column))
    );

    console.log("excelToDatabaseColumnMapping:", excelToDatabaseColumnMapping);

    const sql = `
  INSERT INTO students (student_number, first_name, middle_name, last_name, gender, birthdate, status, email, school_year, program_id, strand)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
    for (const rowValues of data) {
      console.log("Row Values:", rowValues);

      const values = allColumns.map((column) => {
        const lowerCaseColumn = column.toLowerCase();
        const mappedValue =
          excelToDatabaseColumnMapping[lowerCaseColumn] ||
          excelToDatabaseColumnMapping[column];
        return mappedValue ? rowValues[mappedValue] : rowValues[column];
      });

      const facultyNumberIndex = allColumns.indexOf("student_number");
      if (facultyNumberIndex !== -1) {
        values[facultyNumberIndex] = rowValues["Student Number"];
      }

      // Explicitly handle "First Name," "Middle Name," and "Last Name"
      const firstNameIndex = allColumns.indexOf("first_name");
      const middleNameIndex = allColumns.indexOf("middle_name");
      const lastNameIndex = allColumns.indexOf("last_name");
      const genderIndex = allColumns.indexOf("gender");
      const emailIndex = allColumns.indexOf("email");

      if (firstNameIndex !== -1) {
        values[firstNameIndex] = rowValues["First Name"];
      }

      if (middleNameIndex !== -1) {
        values[middleNameIndex] = rowValues["Middle Name"];
      }

      if (lastNameIndex !== -1) {
        values[lastNameIndex] = rowValues["Last Name"];
      }
      if (genderIndex !== -1) {
        values[genderIndex] = rowValues["Gender"];
      }
      if (emailIndex !== -1) {
        values[emailIndex] = rowValues["Email"];
      }

      console.log("Mapped Values:", values);

      console.log("First Name:", rowValues["First Name"]);
      console.log("Middle Name:", rowValues["Middle Name"]);
      console.log("Last Name:", rowValues["Last Name"]);
      console.log("Email", rowValues["Email"]);
      // Convert the birthdate to ISO format if it's available
      const birthdateIndex = includedColumns.indexOf("birthdate");
      if (birthdateIndex !== -1 && rowValues[birthdateIndex]) {
        const birthdate = new Date(rowValues[birthdateIndex])
          .toISOString()
          .slice(0, 10);
        rowValues[birthdateIndex] = birthdate;
      }

      await new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
          if (err) {
            console.error("Error inserting data:", err);
            reject(err);
          } else {
            console.log("Data inserted:", results);
            console.log("Inserted Row Values:", values);
            resolve(results);
          }
        });
      });
    }

    return res
      .status(200)
      .json({ message: "File uploaded and data inserted." });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/facultyupload", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const fileData = req.file.buffer;
    const workbook = xlsx.read(fileData, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const mandatoryColumns = [
      "faculty_id",
      "faculty_fname",
      "faculty_mname",
      "faculty_lname",
      "email",
    ];
    console.log(mandatoryColumns);
    const allColumns = [
      "faculty_id",
      "faculty_fname",
      "faculty_mname",
      "faculty_lname",
      "gender",
      "birthdate",
      "email",
      "faculty_password",
      "program_id",
    ];

    const excelToDatabaseColumnMapping = {
      "Faculty Number": "faculty_id", // Map "Faculty Number" to "faculty_id"
      "First Name": "faculty_fname",
      "Middle Name": "faculty_mname",
      "Last Name": "faculty_lname",
      email: "email",
      // Add other mappings as needed
    };

    const includedColumns = allColumns.filter((column) =>
      // eslint-disable-next-line no-prototype-builtins
      data.every((row) => row.hasOwnProperty(column))
    );

    const sql = `
  INSERT INTO faculty
  (faculty_id, faculty_fname, faculty_mname, faculty_lname, gender, birthdate, email, faculty_password, program_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    // Map Excel data to database format and insert into the database
    for (const rowValues of data) {
      console.log("Row Values:", rowValues);
      const values = allColumns.map((column) => {
        const lowerCaseColumn = column.toLowerCase();
        const mappedValue =
          excelToDatabaseColumnMapping[lowerCaseColumn] ||
          excelToDatabaseColumnMapping[column];
        return mappedValue ? rowValues[mappedValue] : rowValues[column];
      });
      console.log("Mapped Values:", values);

      console.log("First Name:", rowValues["First Name"]);
      console.log("Middle Name:", rowValues["Middle Name"]);
      console.log("Last Name:", rowValues["Last Name"]);

      // Use the actual value from the "faculty number" column as faculty_id
      const facultyNumberIndex = allColumns.indexOf("faculty_id");
      if (facultyNumberIndex !== -1) {
        values[facultyNumberIndex] = rowValues["Faculty Number"];
      }

      // Explicitly handle "First Name," "Middle Name," and "Last Name"
      const firstNameIndex = allColumns.indexOf("faculty_fname");
      const middleNameIndex = allColumns.indexOf("faculty_mname");
      const lastNameIndex = allColumns.indexOf("faculty_lname");

      if (firstNameIndex !== -1) {
        values[firstNameIndex] = rowValues["First Name"];
      }

      if (middleNameIndex !== -1) {
        values[middleNameIndex] = rowValues["Middle Name"];
      }

      if (lastNameIndex !== -1) {
        values[lastNameIndex] = rowValues["Last Name"];
      }

      // Convert the birthdate to ISO format if it's available
      const birthdateIndex = includedColumns.indexOf("birthdate");
      if (birthdateIndex !== -1 && rowValues[birthdateIndex]) {
        const birthdate = new Date(rowValues[birthdateIndex])
          .toISOString()
          .slice(0, 10);
        values[birthdateIndex] = birthdate;
      }

      await new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
          if (err) {
            console.error("Error inserting data:", err);
            reject(err);
          } else {
            console.log("Data inserted:", results);
            console.log("Inserted Row Values:", values);
            resolve(results);
          }
        });
      });
    }

    return res
      .status(200)
      .json({ message: "File uploaded and data inserted." });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pupces@gmail.com",
    pass: "ftji wwdz qlhn lmxg",
  },
});

app.post("/sendEmail", async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    await transporter.sendMail({
      from: "pupces@gmail.com",
      to,
      subject,
      text,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/checkEmail", (req, res) => {
  const { email } = req.body;

  // Execute a MySQL query to check if the email exists in your table
  const sql = "SELECT * FROM students WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    console.log("Query result:", result);

    if (result.length > 0) {
      const { first_name, last_name, student_number } = result[0];
      res
        .status(200)
        .json({ exists: true, first_name, last_name, student_number });
      console.log(first_name, last_name, student_number);
    } else {
      res.status(200).json({ exists: false });
    }
  });
});

app.post("/facultycheckEmail", (req, res) => {
  const { email } = req.body;

  // Execute a MySQL query to check if the email exists in your table
  const sql = "SELECT * FROM faculty WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    console.log("Query result:", result);

    if (result.length > 0) {
      const { faculty_fname, faculty_lname, faculty_id } = result[0];
      res
        .status(200)
        .json({ exists: true, faculty_fname, faculty_lname, faculty_id });
      console.log(faculty_fname, faculty_lname, faculty_id);
    } else {
      // Email doesn't exist
      res.status(200).json({ exists: false });
    }
  });
});
app.post("/admincheckEmail", (req, res) => {
  const { email } = req.body;

  // Execute a MySQL query to check if the email exists in your table
  const sql = "SELECT * FROM admin WHERE admin_email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    console.log("Query result:", result);

    if (result.length > 0) {
      const { admin_email } = result[0];
      res.status(200).json({ exists: true, admin_email });
      console.log(admin_email);
    } else {
      // Email doesn't exist
      res.status(200).json({ exists: false });
    }
  });
});

app.post("/updatePassword", (req, res) => {
  const { student_number, student_password } = req.body;

  console.log(
    "Received request to update password for student number:",
    student_number
  );
  console.log("New password:", student_password);

  const sql =
    "UPDATE students SET student_password = ? WHERE student_number = ?";

  db.query(sql, [student_password, student_number], (err) => {
    if (err) {
      console.error("Error updating password:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    console.log(
      "Password updated successfully for student number:",
      student_number
    );

    res.status(200).json({ success: true });
  });
});

app.post("/facultyupdatePassword", (req, res) => {
  const { faculty_id, faculty_password } = req.body;

  console.log("Received request to update password for  number:", faculty_id);
  console.log("New password:", faculty_password);

  // Execute a MySQL query to update the student_password
  const sql = "UPDATE faculty SET faculty_password = ? WHERE faculty_id = ?";

  db.query(sql, [faculty_password, faculty_id], (err) => {
    if (err) {
      console.error("Error updating password:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json({ success: true });
  });
});
app.post("/adminupdatePassword", (req, res) => {
  const { admin_email, admin_password } = req.body;

  console.log("Received request to update password :", admin_email);
  console.log("New password:", admin_password);

  // Execute a MySQL query to update the student_password
  const sql = "UPDATE admin SET admin_password = ? WHERE admin_email = ?";

  db.query(sql, [admin_password, admin_email], (err) => {
    if (err) {
      console.error("Error updating password:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json({ success: true });
  });
});
app.get("/calculate_total_credit_units", (req, res) => {
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

  db.query(q, [programId, year_started], (err, data) => {
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

app.get("/", (req, res) => {
  res.json("this is the backend");
  console.log("this is the backend");
});

app.get("/check-prerequisites/:studentNumber/:courseCode", async (req, res) => {
  const studentNumber = req.params.studentNumber;
  const courseCode = req.params.courseCode;

  try {
    // Fetch the prerequisite course for the selected course
    const [prerequisiteResult] = await db.execute(
      "SELECT pre_requisite FROM courses WHERE course_code = ?",
      [courseCode]
    );

    // If there is no prerequisite, consider prerequisites as met
    if (!prerequisiteResult[0]?.pre_requisite) {
      return res.json({ prerequisitesMet: true });
    }

    const prerequisiteCourseCode = prerequisiteResult[0].pre_requisite;

    // Check if the student has grades for the prerequisite course
    const [grades] = await db.execute(
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
});

app.get("/students", (req, res) => {
  console.log("Received GET request to /students");

  const studentNumber = req.query.studentNumber;
  console.log("Received student number:", studentNumber);

  if (!studentNumber) {
    logger.error("Student number is missing");
    return res.status(400).json({ error: "Student number is missing" });
  }
  logger.info(
    `Received GET request to /students with student number: ${studentNumber}`
  );
  console.log(
    "Received GET request to /students with student number:",
    studentNumber
  );

  // Validate the student number format using a regular expression
  const studentNumberPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
  if (!studentNumber.match(studentNumberPattern)) {
    return res.status(400).json({ message: "Invalid student number format" });
  }

  // Construct a SQL query to select the student data for the given student number
  const q = "SELECT * FROM students WHERE student_number = ?";

  // Execute the SQL query with the provided student number as a parameter
  db.query(q, [studentNumber], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("SQL Query:", q);
    console.log("SQL Query Parameters:", [studentNumber]);
    console.log("Query Result:", data);

    if (data.length === 0) {
      console.log("No data found for student number:", studentNumber);
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(data[0]); // Assuming there should be only one matching student
  });
});
app.get("/students/all", (req, res) => {
  console.log("Received GET request to /students/all");

  const q = "SELECT * FROM students";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    return res.json(data); // Return all student data
  });
});

app.get("/admin", (req, res) => {
  console.log("Received GET request to /admin");

  const q = "SELECT * FROM admin";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    return res.json(data); // Return all student data
  });
});
app.put("/students/update-status/:studentNumber", (req, res) => {
  console.log("Received PUT request to /students/update-status/:studentNumber");

  const { studentNumber } = req.params;
  const { newStatus } = req.body;

  const q = "UPDATE students SET status = ? WHERE student_number = ?";

  db.query(q, [newStatus, studentNumber], (err, data) => {
    if (err) {
      console.error("Error updating student status in the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    if (data.affectedRows > 0) {
      return res.json({ message: "Student status updated successfully" });
    } else {
      return res.status(404).json({ error: "Student not found" });
    }
  });
});

app.get("/students/program/:program_id", (req, res) => {
  console.log("Received GET request to /students/program");

  const program_id = req.params.program_id;
  const q = "SELECT * FROM students WHERE program_id = ?";

  db.query(q, [program_id], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("SQL Query:", q);
    console.log("Query Result:", data);

    return res.json(data); // Return all student data with the specified program_id
  });
});

app.get("/students/:studentNumber", (req, res) => {
  const studentNumber = req.params.studentNumber;

  // Validate the student number format using a regular expression
  const studentNumberPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
  if (!studentNumber.match(studentNumberPattern)) {
    return res.status(400).json({ message: "Invalid student number format" });
  }

  // Construct a SQL query to select the student data for the given student number
  const q = "SELECT * FROM students WHERE student_number = ?";

  // Execute the SQL query with the provided student number as a parameter
  db.query(q, [studentNumber], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (data.length === 0) {
      console.log("No data found for student number:", studentNumber);
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(data[0]); // Assuming there should be only one matching student
  });
});

app.get("/students/password/:studentNumber", (req, res) => {
  const studentNumber = req.params.studentNumber;

  // Validate the student number format using a regular expression
  const studentNumberPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
  if (!studentNumber.match(studentNumberPattern)) {
    return res.status(400).json({ message: "Invalid student number format" });
  }

  // Construct a SQL query to select the student password for the given student number
  const q = "SELECT student_password FROM students WHERE student_number = ?";

  // Execute the SQL query with the provided student number as a parameter
  db.query(q, [studentNumber], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (data.length === 0) {
      console.log("No data found for student number:", studentNumber);
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ student_password: data[0].student_password });
  });
});

app.get("/faculty/password/:facultyEmail", (req, res) => {
  const facultyEmail = req.params.facultyEmail;

  // Construct a SQL query to select the student password for the given student number
  const q = "SELECT faculty_password FROM faculty WHERE email = ?";

  // Execute the SQL query with the provided student number as a parameter
  db.query(q, [facultyEmail], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (data.length === 0) {
      console.log("No data found for faculty email:", facultyEmail);
      return res.status(404).json({ message: "Faculty not found" });
    }

    return res.json({ faculty_password: data[0].faculty_password });
  });
});

app.get("/faculty/:email", (req, res) => {
  const email = req.params.email;

  // // Validate the faculty ID format using a regular expression
  // const facultyIdPattern = /^[0-9]{4}-[0-9]{5}-[A-Z]{2}-[0-9]$/;
  // if (!facultyId.match(facultyIdPattern)) {
  //   return res.status(400).json({ message: "Invalid faculty ID format" });
  // }

  // Construct a SQL query to select the faculty data for the given faculty ID
  const q = "SELECT * FROM faculty WHERE email = ?";

  // Execute the SQL query with the provided faculty ID as a parameter
  db.query(q, [email], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (data.length === 0) {
      console.log("No data found for faculty email:", email);
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Only return the first matching faculty, assuming there should be only one
    return res.json(data[0]);
  });
});
app.get("/admin/:email", (req, res) => {
  const email = req.params.email;
  console.log("Received email parameter:", email);

  const q = "SELECT * FROM admin WHERE admin_email = ?";

  db.query(q, [email], (err, data) => {
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
});

app.get("/curriculum", (req, res) => {
  console.log("Received GET request to /curriculum");

  // Extract program_id and course_type from the query parameters
  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  if (!programId || !year_started) {
    return res.status(400).json({
      error:
        "Both program_id and year_started are required in the query parameters.",
    });
  }

  // Use a parameterized query to prevent SQL injection
  const q = "SELECT * FROM courses WHERE program_id = ? AND year_started = ?";

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.json(data);
  });
});
app.get("/evalcurriculum", (req, res) => {
  console.log("Received GET request to /evalcurriculum");

  // Extract program_id and course_type from the query parameters
  const programId = req.query.program_id;
  const year_started = req.query.year_started;
  const courseCode = req.query.course_code;

  if (!programId || !year_started || !courseCode) {
    return res.status(400).json({
      error:
        "Both program_id and course_type and course_code are required in the query parameters.",
    });
  }

  // Use a parameterized query to prevent SQL injection
  const q =
    "SELECT * FROM courses WHERE program_id = ? AND year_started = ? AND course_code = ?";

  db.query(q, [programId, year_started, courseCode], (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.json(data);
  });
});
app.get("/curriculum/all", (req, res) => {
  // Fetch all data from the courses table
  const q = "SELECT * FROM courses";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.json(data);
  });
});
app.get("/faculty", (req, res) => {
  // Fetch all data from the courses table
  const q = "SELECT * FROM faculty";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.json(data);
  });
});

app.get("/curriculumyearsem", (req, res) => {
  const { year, semester } = req.query;
  console.log(
    `Received GET request to /curriculum for year ${year} and semester ${semester}`
  );

  // Adjust the SQL query to filter by year and semester
  const q = `SELECT * FROM courses WHERE course_year = ? AND course_sem = ?`;
  db.query(q, [year, semester], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/curriculum/:courseCode", (req, res) => {
  const { courseCode } = req.params;
  console.log(`Received GET request for course code ${courseCode}`);

  // Modify the query to fetch data for the specific course code
  const q = `SELECT * FROM courses WHERE course_code= ?`;
  db.query(q, [courseCode], (err, data) => {
    if (err) return res.json(err);

    // Check if data is not empty
    if (data.length > 0) {
      return res.json(data[0]); // Assuming course_code is unique
    } else {
      return res.status(404).json({ message: "Course not found" });
    }
  });
});
app.get("/curriculum-prerequisite", (req, res) => {
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

  db.query(q, [year_started, programId], (err, data) => {
    if (err) {
      console.error("Error fetching course data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const courses = data.map((course) => ({
      course_code: course.course_code,
      pre_requisite: course.pre_requisite.split(",").map((code) => code.trim()),
    }));

    console.log("Retrieved curriculum data:", courses);
    return res.json(courses);
  });
});

app.get("/curriculum-prerequisite-codes", (req, res) => {
  const studentNumber = req.query.studentNumber;

  // Check if studentNumber is provided
  if (!studentNumber) {
    return res.status(400).json({ error: "StudentNumber is required." });
  }

  // Query to get curriculum with prerequisites
  const q = `
    SELECT DISTINCT c.course_code, c.pre_requisite
    FROM courses c
    WHERE c.pre_requisite IS NOT NULL
      AND TRIM(c.pre_requisite) != '';
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching curriculum data:", err);
      return res.json(err);
    }

    const curriculumWithPrerequisites = data.map((course) => ({
      course_code: course.course_code,
      pre_requisite: course.pre_requisite.split(",").map((code) => code.trim()),
    }));

    console.log(
      "Retrieved curriculum data with prerequisites:",
      curriculumWithPrerequisites
    );
    return res.json(curriculumWithPrerequisites);
  });
});
app.get("/curriculum-prerequisite-codes-grades", (req, res) => {
  const studentNumber = req.query.studentNumber;

  // Query to get curriculum with prerequisites and grades for a specific student
  const q = `
    SELECT DISTINCT c.course_code, c.pre_requisite, g.course_code as pre_req_course, g.grades
    FROM courses c
    INNER JOIN grades g ON c.pre_requisite = g.course_code AND g.student_number = ?
    WHERE (c.pre_requisite IS NOT NULL AND TRIM(c.pre_requisite) != '')
       OR c.course_code IN (
         SELECT DISTINCT pre_requisite FROM courses WHERE pre_requisite IS NOT NULL AND TRIM(pre_requisite) != ''
       );
  `;

  db.query(q, [studentNumber], (err, data) => {
    if (err) {
      console.error("Error fetching curriculum data:", err);
      return res.json(err);
    }

    console.log("Raw data from the database:", data);

    const prerequisitesWithGrades = [];

    data.forEach((course) => {
      const preRequisites = course.pre_requisite
        .split(",")
        .map((code) => code.trim());

      preRequisites.forEach((preReqCode) => {
        console.log("PreReqCode:", preReqCode);
        console.log("Grade:", course.grades);

        if (course.grades !== null) {
          const preReqWithGrade = {
            pre_requisite: preReqCode,
            grade: String(course.grades), // Convert to string
          };
          prerequisitesWithGrades.push(preReqWithGrade);
        } else {
          console.log("Skipping entry without grade:", preReqCode);
        }
      });
    });

    console.log(
      "Retrieved prerequisites with grades:",
      prerequisitesWithGrades
    );
    return res.json(prerequisitesWithGrades);
  });
});

app.get("/curriculum-first-first", (req, res) => {
  console.log("Received GET request to /curriculum-first-first");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  // Assuming your table structure has columns named 'course_code', 'course_year', 'course_sem', 'credit_units', 'program_id', and 'course_type'
  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_year = 1 AND course_sem = 'First Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});

app.get("/curriculumfirst-second", (req, res) => {
  console.log("Received GET request to /first-second");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;
  // Assuming your table structure has columns named 'course_code', 'course_year', 'course_sem', and 'credit_units'
  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_year = 1 AND course_sem = 'Second Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});
app.get("/curriculumsecond-first", (req, res) => {
  console.log("Received GET request to /second-first");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;
  // Assuming your table structure has columns named 'course_code', 'course_year', 'course_sem', and 'credit_units'
  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_year = 2 AND course_sem = 'First Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});
app.get("/curriculumsecond-second", (req, res) => {
  console.log("Received GET request to /second-second");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;
  // Assuming your table structure has columns named 'course_code', 'course_year', 'course_sem', and 'credit_units'
  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_year = 2 AND course_sem = 'Second Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});
app.get("/curriculumthird-first", (req, res) => {
  console.log("Received GET request to /third-first");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;
  // Assuming your table structure has columns named 'course_code', 'course_year', 'course_sem', and 'credit_units'
  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
     WHERE program_id = ? AND year_started = ? AND course_year = 3 AND course_sem = 'First Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});
app.get("/curriculumthird-second", (req, res) => {
  console.log("Received GET request to /third-second");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
     WHERE program_id = ? AND year_started = ? AND course_year = 3 AND course_sem = 'Second Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});

app.get("/curriculumfourth-first", (req, res) => {
  console.log("Received GET request to /fourth-first");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_year = 4 AND course_sem = 'First Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});
app.get("/curriculumfourth-second", (req, res) => {
  console.log("Received GET request to /fourth-second");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_year = 4 AND course_sem = 'Second Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});
app.get("/curriculumsummer", (req, res) => {
  console.log("Received GET request to /fourth-second");

  const programId = req.query.program_id;
  const year_started = req.query.year_started;

  const q = `
    SELECT SUM(credit_unit) as total_credit_units
    FROM courses
    WHERE program_id = ? AND year_started = ? AND course_sem = 'Summer Semester'
  `;

  db.query(q, [programId, year_started], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    // Extract the total credit units from the result
    const totalCreditUnits = data[0].total_credit_units;

    // Log the total credit units to the console
    console.log(`Total Credit Units: ${totalCreditUnits}`);

    return res.json({ totalCreditUnits });
  });
});

app.get("/programs", (req, res) => {
  console.log("Received GET request to /programs");
  const q = `SELECT * FROM programs`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/program", (req, res) => {
  console.log("Received POST request to /programs");

  // Assuming the request body contains program_abbr and program_name
  const { program_abbr, program_name } = req.body;

  if (!program_abbr || !program_name) {
    return res
      .status(400)
      .json({ error: "Both program_abbr and program_name are required." });
  }

  const q = `INSERT INTO programs (program_abbr, program_name) VALUES (?, ?)`;
  const values = [program_abbr, program_name];

  db.query(q, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Assuming you want to return the newly inserted program's details
    const newProgramId = result.insertId;
    const selectQuery = `SELECT * FROM programs WHERE program_id = ?`;

    db.query(selectQuery, [newProgramId], (selectErr, selectData) => {
      if (selectErr) return res.status(500).json({ error: selectErr.message });

      return res.status(201).json(selectData[0]);
    });
  });
});

app.get("/evaluate", (req, res) => {
  console.log("Received GET request to /evaluate");

  const q = "SELECT * FROM evaluate";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/evaluate-student", (req, res) => {
  console.log("Received GET request to /evaluate");

  // Extract the student number from the query parameters
  const studentNumber = req.query.student_number;

  // If student number is not provided, respond with an error
  if (!studentNumber) {
    return res.status(400).json({ error: "Student number is required" });
  }

  // Query to retrieve evaluations for the specified student number
  const q = "SELECT * FROM evaluate WHERE student_number = ?";

  db.query(q, [studentNumber], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    return res.json(data);
  });
});
app.get("/evaluate-faculty", (req, res) => {
  console.log("Received GET request to /evaluate");

  const faculty_id = req.query.faculty_id;

  if (!faculty_id) {
    return res.status(400).json({ error: "Faculty Id is required" });
  }

  // Query to retrieve evaluations for the specified student number
  const q = "SELECT * FROM evaluate WHERE faculty_id = ?";

  db.query(q, [faculty_id], (err, data) => {
    if (err) {
      console.error(err);
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/evaluate-recommend", (req, res) => {
  console.log("Received GET request to /evaluate-recommend");

  const studentNumber = req.query.student_number;
  const year = req.query.eval_year; // Corrected variable name
  const semester = req.query.eval_sem;

  // Adjust your SQL query to filter by student_number, year, and semester
  const q =
    "SELECT * FROM evaluate WHERE student_number = ? AND eval_year = ? AND eval_sem = ?";
  db.query(q, [studentNumber, year, semester], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/evaluate-units", (req, res) => {
  const eval_year = req.query.eval_year; // replace with your actual request parameter
  const eval_sem = req.query.eval_sem;
  const student_number = req.query.student_number;
  console.log("Received GET request to /evaluate");
  const q =
    "SELECT SUM(evalcredit_unit) AS totalEvalCredit FROM evaluate WHERE eval_year = ? AND eval_sem = ? AND student_number = ?";

  db.query(q, [eval_year, eval_sem, student_number], (err, data) => {
    if (err) return res.json(err);

    // The result will be an array with a single object containing the sum
    const totalEvalCredit = data[0].totalEvalCredit;

    return res.json({ totalEvalCredit });
  });
});

app.get("/validateData", (req, res) => {
  console.log("Received GET request to /validateData");

  // Extract student number from the query parameters
  const studentNumber = req.query.studentNumber;

  if (!studentNumber) {
    return res
      .status(400)
      .json({ error: "Student number is required in the query parameters." });
  }

  // Use a parameterized query to prevent SQL injection
  const q = "SELECT course_id FROM validate WHERE student_number = ?";

  db.query(q, [studentNumber], (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      // Handle the case when no data is returned
      return res.status(200).json([]);
    }

    return res.json(data);
  });
});

app.get("/analysis", (req, res) => {
  console.log(`Received GET request to /analysis`);

  const q = `SELECT * FROM analysis`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/validate", (req, res) => {
  console.log("Received GET request to /validate");

  const studentNumber = req.query.student_number;

  const q = `SELECT * FROM validate WHERE student_number = ?`;
  db.query(q, [studentNumber], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/fetch_course_codes", async (req, res) => {
  try {
    // Use the promise-based query method
    const [rows] = await db.execute("SELECT course_id FROM validate");

    // Extract course codes from the result
    const courseCodes = rows.map((row) => row.course_code);

    // Send the course codes as JSON
    res.status(200).json({ course_codes: courseCodes });
  } catch (dbError) {
    console.error("Database error:", dbError);
    res.status(500).json({
      error:
        "Internal Server Error. Check server and database logs for details.",
    });
  }
});

app.get("/facultyId/:facultyId", (req, res) => {
  const facultyId = req.params.facultyId;
  const q = "SELECT * FROM faculty WHERE faculty_id = ?";

  // Assuming you are using a MySQL library like 'mysql' for the database connection
  db.query(q, [facultyId], (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      console.log("No data found for facultyId:", facultyId);
      return res.status(404).json({ error: "Faculty not found" });
    }

    console.log("Result:", data[0]); // Log the result to check
    return res.json(data[0]); // Assuming you expect a single faculty record
  });
});

app.get("/analysis/latest", (req, res) => {
  const q = `
    SELECT remaining_units
    FROM analysis
    ORDER BY analysis_id DESC
    LIMIT 1
  `;

  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data[0]);
  });
});

app.post("/login", (req, res) => {
  const { student_number, password } = req.body;

  db.get(
    "SELECT * FROM students WHERE student_number = ? AND student_password = ?",
    [student_number, password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error("JWT_SECRET is not defined in the .env file");

        return res.status(500).json({ message: "JWT_SECRET is not defined" });
      }

      const token = jwt.sign(
        { student_number: user.student_number, role: user.role },
        jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res.status(200).json({ token });
    }
  );
});

app.post("/grades", async (req, res) => {
  const q = `INSERT INTO grades (student_number, course_id, grades, remarks) VALUES (?,?,?,?)`;
  const values = [
    req.body.student_number,
    req.body.course_id,
    req.body.grades,
    req.body.remarks,
  ];

  try {
    const insertGrades = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await insertGrades();

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/grades", (req, res) => {
  const studentNumber = req.query.studentNumber;

  const q = `SELECT * FROM grades WHERE student_number = ?`;
  db.query(q, [studentNumber], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/failedgrades", (req, res) => {
  // SQL query to fetch records with grades 5 and -1
  const query = "SELECT * FROM grades WHERE grades = 5 OR grades = -1";

  // Execute the query using the connection pool
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Send the results as JSON response
    res.json(results);
  });
});

app.delete("/grades/:studentNumber/:courseId", (req, res) => {
  const studentNumber = req.params.studentNumber;
  const courseId = req.params.courseId;

  const sql = "DELETE FROM grades WHERE student_number = ? AND course_id = ?";
  console.log("Received studentNumber:", studentNumber);
  console.log("Received courseId:", courseId);

  db.query(sql, [studentNumber, courseId], (err, result) => {
    if (err) {
      console.error("Error deleting grades:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Grades deleted successfully" });
      } else {
        res.status(404).json({ message: "Grades not found" });
      }
    }
  });
});

app.put("/update-grades", async (req, res) => {
  try {
    const { studentNumber, course_id, grades, remarks } = req.body;
    if (
      !studentNumber ||
      !course_id ||
      grades === undefined ||
      remarks === undefined
    ) {
      return res.status(400).json({ error: "Invalid request. Missing data." });
    }

    const selectSql = `SELECT * FROM grades WHERE student_number = ? AND course_id = ?`;
    const selectValues = [studentNumber, course_id];

    db.query(selectSql, selectValues, async (selectErr, selectResult) => {
      if (selectErr) {
        console.error("Error checking for existing entry:", selectErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (selectResult.length > 0) {
        const updateSql = `UPDATE grades SET grades = ?, remarks = ? WHERE student_number = ? AND course_id = ?`;
        const updateValues = [grades, remarks, studentNumber, course_id];

        db.query(updateSql, updateValues, (updateErr) => {
          if (updateErr) {
            console.error("Error updating grades:", updateErr);
            res.status(500).json({ error: "Internal server error" });
          } else {
            console.log("Grades updated successfully");
            res.status(200).json({ message: "Grades updated successfully" });
          }
        });
      } else {
        const insertSql = `INSERT INTO grades (student_number, course_id, grades, remarks) VALUES (?, ?, ?, ?)`;
        const insertValues = [studentNumber, course_id, grades, remarks];

        db.query(insertSql, insertValues, (insertErr) => {
          if (insertErr) {
            console.error("Error inserting new grades:", insertErr);
            res.status(500).json({ error: "Internal server error" });
          } else {
            console.log("New grades inserted successfully");
            res
              .status(200)
              .json({ message: "New grades inserted successfully" });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error updating/inserting grades:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/grades/:studentNumber/:courseCode", (req, res) => {
  const course_id = req.params.course_id;
  const studentNumber = req.params.studentNumber;
  const updatedGrades = req.body.grades;

  console.log("PUT request received for studentNumber:", studentNumber);
  console.log("Course Code:", course_id);
  console.log("Updated Grades:", updatedGrades);

  const sql = `UPDATE grades SET grades = ? WHERE course_id = ? AND student_number = ?`;

  console.log("SQL Query:", sql);
  console.log("SQL Parameters:", [updatedGrades, course_id, studentNumber]);

  db.query(sql, [updatedGrades, course_id, studentNumber], (err) => {
    if (err) {
      console.error("Error updating grades:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      const selectSql = `SELECT * FROM grades WHERE course_code = ? AND student_number = ?`;

      console.log("SELECT SQL Query:", selectSql);
      console.log("SELECT SQL Parameters:", [course_id, studentNumber]);

      db.query(selectSql, [course_id, studentNumber], (selectErr, result) => {
        if (selectErr) {
          console.error("Error retrieving updated grades:", selectErr);
          res.status(500).json({ error: "Internal server error" });
        } else {
          if (result.length === 1) {
            const updatedGradesData = {
              courseCode: result[0].course_code,
              grades: result[0].grades,
              studentNumber: result[0].student_number,
            };
            console.log("Updated Grades Data:", updatedGradesData);
            res.status(200).json(updatedGradesData);
          } else {
            res.status(404).json({ error: "Grades not found" });
          }
        }
      });
    }
  });
});

app.put("/students/:studentNumber", (req, res) => {
  console.log("Received PUT request to /students");

  const studentNumber = req.params.studentNumber;
  console.log("Received student number:", studentNumber);

  // Assuming you have a request body with the updated student information
  const updatedStudentData = req.body;
  console.log("Received updated student data:", updatedStudentData);

  // If the student does not exist, insert a new student
  const insertQuery =
    "INSERT INTO students (`student_number`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `status`, `email`, `school_year`,  `program_id`, `strand`) VALUES (?)";
  const insertValues = [
    updatedStudentData.student_number,
    updatedStudentData.first_name,
    updatedStudentData.middle_name,
    updatedStudentData.last_name,
    updatedStudentData.gender,
    updatedStudentData.birthdate,
    updatedStudentData.status,
    updatedStudentData.email,
    updatedStudentData.school_year,
    updatedStudentData.program_id,
    updatedStudentData.strand,
  ];

  // Execute the SQL query with the updated student data as parameters
  db.query(insertQuery, [insertValues], (insertErr, insertResult) => {
    if (insertErr) {
      console.error("Error inserting into the database:", insertErr);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("Insert Query:", insertQuery);
    console.log("Insert Query Parameters:", [insertValues]);
    console.log("Insert Result:", insertResult);

    // Check if the student was inserted (affectedRows is greater than 0)
    if (insertResult.affectedRows > 0) {
      return res.json({ message: "Student inserted successfully" });
    }

    // If the student exists, update the existing student
    const updateQuery = "UPDATE students SET ? WHERE student_number = ?";
    // Execute the SQL query with the updated student data and student number as parameters
    db.query(
      updateQuery,
      [updatedStudentData, studentNumber],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating the database:", updateErr);
          return res.status(500).json({ error: "Internal server error" });
        }

        console.log("Update Query:", updateQuery);
        console.log("Update Query Parameters:", [
          updatedStudentData,
          studentNumber,
        ]);
        console.log("Update Result:", updateResult);

        // Check if the student was updated (affectedRows is greater than 0)
        if (updateResult.affectedRows > 0) {
          // If the update is successful, also fetch the updated student data
          const selectQuery = "SELECT * FROM students WHERE student_number = ?";
          // Execute the SQL query to select the updated student data
          db.query(selectQuery, [studentNumber], (selectErr, selectResult) => {
            if (selectErr) {
              console.error("Error selecting from the database:", selectErr);
              return res.status(500).json({ error: "Internal server error" });
            }

            console.log("Select Query:", selectQuery);
            console.log("Select Query Parameters:", [studentNumber]);
            console.log("Select Result:", selectResult);

            // Check if the student was found
            if (selectResult.length > 0) {
              return res.json({
                message: "Student updated successfully",
                updatedStudent: selectResult[0],
              });
            }

            return res.status(404).json({ message: "Student not found" });
          });
        } else {
          // If the student neither exists nor was inserted, return an error
          return res.status(404).json({ message: "Student not found" });
        }
      }
    );
  });
});

app.put("/updatestudents/:studentNumber", (req, res) => {
  const studentNumber = req.params.studentNumber;
  const updatedStudentData = req.body;

  const updateQuery = "UPDATE students SET ? WHERE student_number = ?";
  db.query(
    updateQuery,
    [updatedStudentData, studentNumber],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating the database:", updateErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      console.log("Update Query:", updateQuery);
      console.log("Update Query Parameters:", [
        updatedStudentData,
        studentNumber,
      ]);
      console.log("Update Result:", updateResult);

      if (updateResult.affectedRows > 0) {
        return res.json({ message: "Student updated successfully" });
      } else {
        return res.status(404).json({ message: "Student not found" });
      }
    }
  );
});

app.put("/updatefaculty/:email", (req, res) => {
  const email = req.params.email;
  const updatedFacultyData = req.body;

  const updateQuery = "UPDATE faculty SET ? WHERE email = ?";
  db.query(
    updateQuery,
    [updatedFacultyData, email],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating the database:", updateErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      console.log("Update Query:", updateQuery);
      console.log("Update Query Parameters:", [updatedFacultyData, email]);
      console.log("Update Result:", updateResult);

      if (updateResult.affectedRows > 0) {
        return res.json({ message: "Faculty updated successfully" });
      } else {
        return res.status(404).json({ message: "Faculty not found" });
      }
    }
  );
});

app.put("/updateadmin", async (req, res) => {
  const updatedAdminData = req.body;

  const updateQuery = "UPDATE admin SET ?";

  db.query(updateQuery, [updatedAdminData], (updateErr, updateResult) => {
    if (updateErr) {
      console.error("Error updating the database:", updateErr);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log("Update Query:", updateQuery);
    console.log("Update Result:", updateResult);

    if (updateResult.affectedRows > 0) {
      return res.json({ message: "Admin updated successfully" });
    } else {
      return res.status(404).json({ message: "Admin not found" });
    }
  });
});

app.put("/faculty/:facultyId", async (req, res) => {
  const facultyId = req.params.facultyId;
  const updatedFacultyData = req.body;

  // Update the faculty data in the database based on facultyId
  const q =
    "UPDATE analysis SET faculty_fname=?, faculty_mname=?, faculty_lname=?, gender=?, birthdate=?, email=?, faculty_password=?, program_id=? WHERE faculty_id=?";
  const values = [
    updatedFacultyData.faculty_fname,
    updatedFacultyData.faculty_mname,
    updatedFacultyData.faculty_lname,
    updatedFacultyData.gender,
    updatedFacultyData.birthdate,
    updatedFacultyData.email,
    updatedFacultyData.faculty_password,
    updatedFacultyData.program_id, // Add program_id to the values array
    facultyId,
  ];

  try {
    const updateFaculty = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await updateFaculty();

    console.log("Data updated successfully");

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data in the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/students/:studentNumber", async (req, res) => {
  const studentNumber = req.params.studentNumber;

  const q =
    "UPDATE students SET  `gender`=?,  `status`=?,  `school_year`=?,  `program_id`=?, `strand`=? WHERE `student_number`=?";
  const values = [
    req.body.gender,
    req.body.status,
    req.body.school_year,
    req.body.program_id,
    req.body.strand,
    studentNumber,
  ];

  try {
    const updateStudent = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    const result = await updateStudent();
    console.log("Update Result:", result);

    res.json(result);
  } catch (error) {
    console.error("Error during update:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while updating the student" });
  }
});
app.post("/faculty/:facultyId", (req, res) => {
  const facultyId = req.params.facultyId;
  const { gender, birthdate, program_id } = req.body;

  // Validate faculty ID and other data here

  // Format the birthdate value in 'YYYY-MM-DD' format
  const formattedBirthdate = new Date(birthdate).toISOString().split("T")[0];

  // Construct a SQL query to update faculty data
  const q =
    "UPDATE faculty SET gender=?, birthdate=?, program_id=? WHERE faculty_id=?";

  // Execute the SQL query with the provided parameters
  db.query(
    q,
    [gender, formattedBirthdate, program_id, facultyId],
    (err, result) => {
      if (err) {
        console.error("Error during update:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if any rows were affected by the update
      if (result.affectedRows === 0) {
        console.log("No faculty found for faculty ID:", facultyId);
        return res.status(404).json({ message: "Faculty not found" });
      }

      // Successful update
      res.status(200).json({ message: "Faculty data updated successfully" });
    }
  );
});

// app.post("/faculty/:facultyId", async (req, res) => {
//   const facultyId = req.params.facultyId;
//   const q =
//     "INSERT INTO faculty(`faculty_id`,`faculty_fname`,`faculty_mname`, `faculty_lname`, `gender`, `birthdate`, `email`, `faculty_password`) VALUES(?,?,?,?,?,?,?,?)";
//   const values = [
//     facultyId,
//     req.body.faculty_fname,
//     req.body.faculty_mname,
//     req.body.faculty_lname,
//     req.body.gender,
//     req.body.birthdate,
//     req.body.email,
//     req.body.faculty_password,
//   ];

//   try {
//     const insertFaculty = async () => {
//       return new Promise((resolve, reject) => {
//         db.query(q, values, (err, data) => {
//           if (err) reject(err);
//           else resolve(data);
//         });
//       });
//     };

//     await insertFaculty();

//     console.log(
//       `Faculty data for faculty_id ${facultyId} inserted successfully`
//     );

//     res.status(201).json({
//       message: `Faculty data for faculty_id ${facultyId} inserted successfully`,
//     });
//   } catch (error) {
//     console.error(
//       `Error inserting faculty data for faculty_id ${facultyId} into the database: `,
//       error
//     );
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.post("/programs", async (req, res) => {
  const q = "INSERT INTO programs (`program_name`) VALUES(?)"; // Assuming you have a table named 'programs' with a column 'program_name'
  const values = [req.body.program_name];

  try {
    const insertProgram = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, [values], (err, data) => {
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
      .json({ error: "An error occurred while creating the program" });
  }
});

app.post("/students", async (req, res) => {
  const q =
    "INSERT INTO students (`student_number`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `status`, `email`, `school_year`,  `program_id`, `strand`) VALUES(?)";
  const values = [
    req.body.student_number,
    req.body.first_name,
    req.body.middle_name,
    req.body.last_name,
    req.body.gender,
    req.body.birthdate,
    req.body.status,
    req.body.email,
    req.body.school_year,
    req.body.program_id,
    req.body.strand,
  ];

  try {
    const insertStudent = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, [values], (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    const result = await insertStudent();

    res.json(result);
  } catch (error) {
    console.error("Error during user signin:", error.message);
    res.status(500).json({ error: "An error occurred while signing the user" });
  }
});
app.post("/update_analysis", async (req, res) => {
  try {
    const analysisDataToInsert = req.body;

    if (!analysisDataToInsert || !Array.isArray(analysisDataToInsert)) {
      return res.status(400).json({ error: "Invalid request. Missing data." });
    }

    // Use a loop or Promise.all to insert each record
    for (const item of analysisDataToInsert) {
      const { grade_id, student_number, course_code, remaining_units } = item;

      if (
        !grade_id ||
        !student_number ||
        !course_code ||
        remaining_units === undefined
      ) {
        return res
          .status(400)
          .json({ error: "Invalid request. Missing data." });
      }

      const insertSql = `
        INSERT INTO analysis (grade_id, student_number, course_code, remaining_units)
        VALUES (?, ?, ?, ?)
      `;
      const insertValues = [
        grade_id,
        student_number,
        course_code,
        remaining_units,
      ];

      db.query(insertSql, insertValues, (insertErr) => {
        if (insertErr) {
          console.error("Error inserting data into analysis table:", insertErr);
          res.status(500).json({ error: "Internal server error" });
        }
      });
    }

    console.log("Analysis table data inserted successfully");
    res
      .status(201)
      .json({ message: "Analysis table data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into analysis table:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/faculty", async (req, res) => {
  //  "yyyy-MM-dd" format
  const formattedBirthdate = new Date(req.body.birthdate)
    .toISOString()
    .split("T")[0];
  const q =
    "INSERT INTO analysis(`faculty_id`,`faculty_fname`,`faculty_mname`, `faculty_lname`, `gender`, `birthdate`, `email`, `faculty_password`) VALUES(?,?,?,?,?,?,?,?)";
  const values = [
    req.body.faculty_id,
    req.body.faculty_fname,
    req.body.faculty_mname,
    req.body.faculty_lname,
    req.body.gender,
    formattedBirthdate,
    req.body.email,
    req.body.faculty_password,
  ];

  try {
    const insertFaculty = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await insertFaculty();

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/students/:studentNumber", (req, res) => {
  const studentNumberParam = req.params.studentNumber;
  const student = student.find(
    (student) => student.studentNumber === studentNumberParam
  );

  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

// app.get("/faculty/:facultyId", (req, res) => {
//   const facultyIdParam = req.params.facultyId;
//   const faculty = faculty.find(
//     (student) => student.facultyId === facultyIdParam
//   );

//   if (faculty) {
//     res.json(faculty);
//   } else {
//     res.status(404).json({ error: "Faculty not found" });
//   }
// });
app.get("/validation-status", (req, res) => {
  const studentNumber = req.query.student_number;
  const course_id = req.query.course_id;

  const q = `SELECT date_validated FROM validate WHERE student_number = ? AND course_id = ?`;
  console.log("Query:", q);

  db.query(q, [studentNumber, course_id], (err, data) => {
    if (err) {
      console.error("Error fetching validation status:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch validation status" });
    }

    if (data.length === 0) {
      console.log("No validation data found for the given parameters");
      // If no data is found, you can return an empty response or a specific message
      return res.status(200).json({ date_validated: null });
    }

    console.log("Validation Date Found:", data[0].date_validated);
    // Assuming data[0] contains the validation date, you can send it as a response
    return res.status(200).json({ date_validated: data[0].date_validated });
  });
});
const queryAsync = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
app.post("/validate", async (req, res) => {
  console.log("Received request body:", req.body);

  const dataToValidate = req.body;

  if (dataToValidate.length === 0) {
    return res.status(400).json({ error: "No data to validate" });
  }

  try {
    const insertPromises = dataToValidate.map(async (item) => {
      const studentNumber = item.student_number;
      const gradeId = item.grade_id;
      console.log("Received date to validate:", item.date_validated);
      // Parse the date from the request data
      const dateValidated = new Date(item.date_validated);

      // Check if the date is a valid date
      if (isNaN(dateValidated)) {
        throw new Error("Invalid date format");
      }
      const formattedDate = dateValidated.toISOString().slice(0, 10);

      const checkDuplicateSql = `
        SELECT COUNT(*) as count
        FROM validate
        WHERE student_number = ? AND course_id = ? AND date_validated IS NOT NULL
      `;
      const [result] = await queryAsync(checkDuplicateSql, [
        studentNumber,
        item.course_id,
      ]);

      if (result && result.count > 0) {
        // Skip inserting duplicate record
        console.log("Duplicate record found. Skipping insertion.");
        return;
      }
      const sql =
        `INSERT INTO validate (` +
        " `student_number`, `grade_id`, `faculty_id`, `date_validated`, `course_id`" +
        ") VALUES ( ?, ?, ?, ?, ?)";
      const values = [
        true,
        studentNumber,
        gradeId,
        item.faculty_id,
        formattedDate,
        item.course_id,
      ];

      return new Promise((resolve, reject) => {
        db.query(sql, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    });

    // Execute all the database insert operations concurrently
    await Promise.all(insertPromises);

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    if (error.message === "Invalid date format") {
      res.status(400).json({ error: "Invalid date format" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.post("/faculty", async (req, res) => {
  const q =
    "INSERT INTO faculty(`faculty_id`,`faculty_fname`,`faculty_mname`, `faculty_lname`, `gender`, `birthdate`, `email`, `faculty_password`) VALUES(?,?,?,?,?,?,?,?)";
  const values = [
    req.body.faculty_id,
    req.body.faculty_fname,
    req.body.faculty_mname,
    req.body.faculty_lname,
    req.body.birthdate,
    req.body.email,
    req.body.faculty_password,
  ];

  try {
    const insertFaculty = async () => {
      return new Promise((resolve, reject) => {
        db.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await insertFaculty();

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/evaluate", async (req, res) => {
  const q =
    "INSERT INTO evaluate(course_reco, evalcredit_unit, requiredcredit_unit, faculty_id, student_number,date_eval, eval_year, eval_sem) VALUES (?, ?, ?, ?,?, ?, ?,?)";
  const values = [
    req.body.course_reco,
    req.body.evalcredit_unit,
    req.body.requiredcredit_unit,
    req.body.faculty_id,
    req.body.student_number,
    req.body.date_eval,
    req.body.eval_year,

    req.body.eval_sem,
  ];

  try {
    const insertEvaluate = () => {
      return new Promise((resolve, reject) => {
        db.query(q, values, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    };

    await insertEvaluate();

    console.log("Data inserted successfully");

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into the database: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/evaluate-get", async (req, res) => {
  const courseCode = req.query.course_reco;

  const q = "SELECT date_eval FROM evaluate WHERE course_reco = ?";
  db.query(q, [courseCode], (err, data) => {
    if (err) return res.json(err);

    if (data.length > 0) {
      const dateEval = data[0].date_eval;
      return res.json({ date_eval: dateEval });
    } else {
      return res.status(404).json({ error: "Course code not found" });
    }
  });
});

function verifyToken(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.headers.authorization;

  try {
    const decodedToken = jwt.verify(token, jwtSecret);

    if (decodedToken.role === "student") {
      req.decodedToken = decodedToken;
      next();
    } else if (decodedToken.role === "faculty") {
      req.decodedToken = decodedToken;
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token is invalid" });
  }
}

app.get("/protected-route", verifyToken, (req, res) => {
  const userId = req.decodedToken.userId;
  res.json({ message: `Authenticated user with ID: ${userId}` });
});

app.get("/student-protected-route", verifyToken, (req, res) => {
  const studentNumber = req.decodedToken.student_number;
  res.json({
    message: `Authenticated student with student number: ${studentNumber}`,
  });
});

app.get("/faculty-protected-route", verifyToken, (req, res) => {
  const facultyId = req.decodedToken.faculty_id;
  res.json({ message: `Authenticated faculty with faculty ID: ${facultyId}` });
});

function protectStudentRoute(req, res, next) {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
}

function protectFacultyRoute(req, res, next) {
  if (req.user && req.user.role === "faculty") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
}

app.get("/student/dashboard", protectStudentRoute, (req, res) => {
  res.json({ message: "Welcome to the student dashboard" });
});

app.get("/faculty/dashboard", protectFacultyRoute, (req, res) => {
  res.json({ message: "Welcome to the faculty dashboard" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
