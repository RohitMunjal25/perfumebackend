const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Perfume Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verification OTP",
    html: `<h2>Your OTP is: ${otp}</h2>`
  });
};

const sendNewsletterWelcome = async (email) => {
  await transporter.sendMail({
    from: `"Perfume Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Our Newsletter!",
    html: `<h2>Thank you for subscribing!</h2><p>You have successfully subscribed to our newsletter. We will keep you updated with our latest products and offers.</p>`
  });
};

const sendContactTicket = async (email, ticketNumber) => {
  await transporter.sendMail({
    from: `"Perfume Store Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Complaint Registered - Ticket #${ticketNumber}`,
    html: `<h2>Support Ticket Generated</h2>
           <p>Your query has been received. Your ticket number is <strong>${ticketNumber}</strong>.</p>
           <p>Our team will look into this and respond shortly.</p>`
  });
};

const sendTrackingUpdate = async (email, orderId, trackingLink, courierName) => {
  await transporter.sendMail({
    from: `"Perfume Store Orders" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Order ${orderId} has been Dispatched!`,
    html: `<h2>Good News! Your order is on the way.</h2>
           <p>Your item has been dispatched via <strong>${courierName}</strong>.</p>
           <p>You can track your order here: <a href="${trackingLink}">${trackingLink}</a></p>`
  });
};

module.exports = {
  sendOTPEmail,
  sendNewsletterWelcome,
  sendContactTicket,
  sendTrackingUpdate
};