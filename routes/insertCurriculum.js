import express from "express";

import { pool } from "./../db.js";

const router = express();
router.use(express.json());

router.post("/insertData", async (req, res) => {
  const { yearStarted, programId, data } = req.body;

  try {
    const sheetInsertions = await Promise.all(
      data.map(async (sheetData, index) => {
        console.log("Sheet Data:", sheetData);
        const sheetName = `Sheet${index + 1}`; // Assuming sheets are named Sheet1, Sheet2, etc.
        const sql =
          "INSERT INTO courses (year_started, course_code, course_title, credit_unit, pre_requisite, course_year, course_sem, num_lab, num_lecture, program_id) VALUES ?";

        const values = sheetData.map((row) => [
          yearStarted,
          row.course_code,
          row.course_title,
          row.credit_unit,
          row.pre_requisite,
          row.course_year,
          row.course_sem,
          row.num_lab,
          row.num_lecture,
          programId,
        ]);

        await new Promise((resolve, reject) => {
          pool.query(sql, [values], (err, result) => {
            if (err) {
              console.error(
                `Error inserting data from ${sheetName} into MySQL:`,
                err
              );
              reject(err);
            } else {
              // Reset the form, empty the table, and the selected excel
              console.log(
                `Data from ${sheetName} inserted into MySQL:`,
                result
              );
              resolve(result);
            }
          });
        });
      })
    );

    res.status(200).send("Data inserted into MySQL");
  } catch (error) {
    console.error("Error processing sheets:", error);
    res.status(500).send("Error processing sheets");
  }
});

export default router;
