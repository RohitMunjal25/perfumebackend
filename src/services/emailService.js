const nodemailer = require("nodemailer");

const transporter =
nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail =
async (email, otp) => {

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <h2>Perfume Store Verification</h2>
      <h1>${otp}</h1>
      <p>OTP valid for 5 minutes.</p>
    `
  });

};

module.exports = sendOTPEmail;