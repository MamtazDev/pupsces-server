import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { pool } from "./db.js";
import adminGet from "./routes/adminGet.js";
import adminPut from "./routes/adminPut.js";
import checkEmail from "./routes/checkEmail.js";
import curriculumGet from "./routes/curriculumGet.js";
import evaluateGet from "./routes/evaluateGet.js";
import evaluatePost from "./routes/evaluatePost.js";
import facultyGet from "./routes/facultyGet.js";
import facultyPost from "./routes/facultyPost.js";
import gradesDelete from "./routes/gradesDelete.js";
import gradesGet from "./routes/gradesGet.js";
import gradesPost from "./routes/gradesPost.js";
import programsGet from "./routes/programsGet.js";
import programsPost from "./routes/programsPost.js";
import protectRoute from "./routes/protecRoute.js";
import sendEmail from "./routes/sendEmail.js";
import studentGet from "./routes/studentGet.js";
import studentPost from "./routes/studentPost.js";
import studentPut from "./routes/studentPut.js";
import updateGrades from "./routes/updateGrades.js";
import updatePass from "./routes/updatePass.js";
import uploadRouter from "./routes/upload.js";
import validateGet from "./routes/validateGet.js";
import validatePost from "./routes/validatePost.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to your API!");
});

app.use("/api", uploadRouter);
app.use("/api", sendEmail);
app.use("/api", checkEmail);
app.use("/api", updatePass);
app.use("/api", studentGet);
app.use("/api", studentPost);
app.use("/api", studentPut);
app.use("/api", protectRoute);
app.use("/api", facultyPost);
app.use("/api", facultyGet);
app.use("/api", gradesGet);
app.use("/api", curriculumGet);
app.use("/api", gradesPost);
app.use("/api", evaluateGet);
app.use("/api", evaluatePost);
app.use("/api", programsGet);
app.use("/api", programsPost);
app.use("/api", validateGet);
app.use("/api", validatePost);
app.use("/api", adminGet);
app.use("/api", adminPut);
app.use("/api", gradesDelete);
app.use("/api", updateGrades);

pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
