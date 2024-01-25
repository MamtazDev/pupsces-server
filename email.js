import { createTransport } from "nodemailer";


const transporter = createTransport({
  service: "gmail", 
  auth: {
    user: "pupces@gmail.com",
    pass: "pupces",
  },
});


export default transporter;
