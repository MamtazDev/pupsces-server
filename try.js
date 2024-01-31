























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














const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
