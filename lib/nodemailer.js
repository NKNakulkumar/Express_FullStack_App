import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();
// Create a test testAccount or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
  
});
// console.log("Ethereal account ready:", testAccount);

export const sendEmail = async({ to, subject, html }) => {
  if (!transporter) {
    throw new Error("Transporter not initialized yet");
  }
 const info = await transporter.sendMail({
    from: `URL SHORTNER '<${testAccount.user}>'`,
    to,
    subject,
    html,
  });
 const testEmailUrl =  nodemailer.getTestMessageUrl(info)
  console.log("Email Verify ",testEmailUrl)
  // return testEmailUrl
};
