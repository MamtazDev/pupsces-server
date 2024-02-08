import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import { pool } from "./../db.js";
import fs from 'fs'

// import { upload } from "../multerConfig.js";

const router = express.Router();
// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }

    if (!fs.existsSync("public/images")) {
      fs.mkdirSync("public/images");
    }

    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });




router.post("/upload", upload.single("image"), async (req, res) => {

  try {
    const { name, inputMessage, email, programId } = req.body;

    let image = null
    if( req.file !== undefined){
       image = req.file.filename;
       console.log('req',req.file.filename)
    }
   
    
    
    // const image = null
    // if(req.file){
    //   image = req.file.filename;
    //   console.log('req',req.file)
    // }

    // console.log("INSERT INTO message", name, inputMessage, req.file.filename, email)

    const sql = 'INSERT INTO message (name, inputMessage, email, image, programId) VALUES (?, ?, ?, ?, ?)';
    pool.query(sql, [ name, inputMessage, email, image, programId ], (err, result) => {
      if (err) {
        console.log('Data insertion err:', err);
      };
      console.log('Data inserted:', result);
      res.send('Data inserted successfully');
    });
    res.send('Error - Data inserted successfully');

  } catch (error) {
    console.log('Data inserting error:', error)
  }


  // try {
  //   if (!req.file) {
  //     return res.status(400).json({ message: "No file uploaded." });
  //   }

  //   const fileData = req.file.buffer;
  //   const workbook = xlsx.read(fileData, { type: "buffer" });
  //   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //   const data = xlsx.utils.sheet_to_json(worksheet);

  //   const allColumns = [
  //     "student_number",
  //     "first_name",
  //     "middle_name",
  //     "last_name",
  //     "gender",
  //     "birthdate",
  //     "status",
  //     "email",
  //     "school_year",
  //     "strand",
  //     "program_id",
  //     "student_password",
  //   ];

  //   const excelToDatabaseColumnMapping = {
  //     "Student Number": "student_number",
  //     "First Name": "first_name",
  //     "Middle Name": "middle_name",
  //     "Last Name": "last_name",
  //     gender: "gender",
  //     email: "email",
  //     program: "program_id",
  //   };

  //   const includedColumns = allColumns.filter((column) =>
  //     data.every((row) => row.hasOwnProperty(column))
  //   );

  //   const sql = `
  //     INSERT INTO students (student_number, first_name, middle_name, last_name, gender, birthdate, status, email, school_year, strand, program_id, student_password)
  //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //   `;

  //   for (const rowValues of data) {
  //     try {
  //       const values = allColumns.map((column) => {
  //         const lowerCaseColumn = column.toLowerCase();
  //         const mappedValue =
  //           excelToDatabaseColumnMapping[lowerCaseColumn] ||
  //           excelToDatabaseColumnMapping[column];
  //         return mappedValue ? rowValues[mappedValue] : rowValues[column];
  //       });

  //       const facultyNumberIndex = allColumns.indexOf("student_number");
  //       if (facultyNumberIndex !== -1) {
  //         values[facultyNumberIndex] = rowValues["Student Number"];
  //       }

  //       const firstNameIndex = allColumns.indexOf("first_name");
  //       const middleNameIndex = allColumns.indexOf("middle_name");
  //       const lastNameIndex = allColumns.indexOf("last_name");
  //       const genderIndex = allColumns.indexOf("gender");
  //       const emailIndex = allColumns.indexOf("email");
  //       const programIndex = allColumns.indexOf("program_id");

  //       if (firstNameIndex !== -1) {
  //         values[firstNameIndex] = rowValues["First Name"];
  //       }

  //       if (middleNameIndex !== -1) {
  //         values[middleNameIndex] = rowValues["Middle Name"];
  //       }

  //       if (lastNameIndex !== -1) {
  //         values[lastNameIndex] = rowValues["Last Name"];
  //       }
  //       if (genderIndex !== -1) {
  //         values[genderIndex] = rowValues["Gender"];
  //       }
  //       if (emailIndex !== -1) {
  //         values[emailIndex] = rowValues["email"];
  //       }
  //       if (programIndex !== -1) {
  //         values[programIndex] = rowValues["program"];
  //       }

  //       const birthdateIndex = includedColumns.indexOf("birthdate");
  //       if (birthdateIndex !== -1 && rowValues[birthdateIndex]) {
  //         const birthdate = new Date(rowValues[birthdateIndex])
  //           .toISOString()
  //           .slice(0, 10);
  //         rowValues[birthdateIndex] = birthdate;
  //       }

  //       const results = await new Promise((resolve, reject) => {
  //         pool.query(sql, values, (err, results) => {
  //           if (err) {
  //             console.error("Error inserting data:", err);
  //             reject(err);
  //           } else {
  //             console.log("Data inserted:", results);
  //             console.log("Inserted Row Values:", values);
  //             resolve(results);
  //           }
  //         });
  //       });

  //       console.log("Results:", results);
  //     } catch (error) {
  //       console.error("Error inserting row:", error);
  //     }
  //   }

  //   return res
  //     .status(200)
  //     .json({ message: "File uploaded and data inserted." });
  // } catch (error) {
  //   console.error("Error processing file:", error);
  //   return res.status(500).json({ message: "Internal server error." });
  // }
});

router.post("/facultyupload", upload.single("excelFile"), async (req, res) => {
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
        pool.query(sql, values, (err, results) => {
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

export default router;
