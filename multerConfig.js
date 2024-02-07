// // const multer = require("multer");
// // const fs = require("fs");
// // const path = require("path");
// import multer from "multer";
// import  path  from 'path';
// import  fs  from 'fs';


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (!fs.existsSync("public")) {
//       fs.mkdirSync("public");
//     }

//     if (!fs.existsSync("public/images")) {
//       fs.mkdirSync("public/images");
//     }

//     cb(null, "public/images");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     var ext = path.extname(file.originalname);

//     if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
//       return cb(new Error("Only images are allowed!"));
//     }

//     cb(null, true);
//   },
//   limits: {
//     fileSize: 500 * 1024 * 1024,
//   },
// });

// // Middleware for handling Multer errors
// const handleMulterError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ error: "Multer error: " + err.message });
//   } else if (err) {
//     return res.status(500).json({ error: err.message });
//   }

//   next();
// };

// module.exports = {
//   upload,
//   handleMulterError,
// };
