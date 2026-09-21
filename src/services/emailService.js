const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const brand = "Darnera";

const template = (title, body) =>
`<!doctype html>
<html><body style="margin:0;padding:0;background:#eee7df;color:#2f2924;font-family:Arial,Helvetica,sans-serif;">
  <div style="padding:36px 16px;background:linear-gradient(135deg,#eee7df 0%,#f8f4ee 100%);">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;border-collapse:separate;overflow:hidden;background:#fffdfa;border-radius:24px;box-shadow:0 14px 45px rgba(50,40,32,.12);">
      <tr><td style="padding:30px 34px;background:#2d3d34;text-align:center;">
        <div style="font-family:Georgia,'Times New Roman',serif;color:#fffaf3;font-size:29px;letter-spacing:8px;line-height:1;text-transform:uppercase;">${brand}</div>
        <div style="margin-top:11px;color:#e9c49c;font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">The scent of authority</div>
      </td></tr>
      <tr><td style="padding:38px 34px 30px;">
        <div style="display:inline-block;margin-bottom:16px;padding:7px 10px;border-radius:99px;background:#f5eadf;color:#9a6544;font-size:10px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;">Darnera update</div>
        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:29px;font-weight:normal;line-height:1.2;color:#302820;">${title}</h1>
        <div style="font-size:15px;line-height:1.75;color:#65574c;">${body}</div>
      </td></tr>
      <tr><td style="padding:22px 34px;background:#faf6f0;border-top:1px solid #eadfd4;text-align:center;color:#958578;font-size:11px;line-height:1.6;">
        <strong style="color:#5f4f43;letter-spacing:1px;">DARNERA</strong><br />
        © ${new Date().getFullYear()} Darnera. Crafted with intention.
      </td></tr>
    </table>
  </div>
</body></html>`;

const send = (to, subject, html) =>
transporter.sendMail({
  from: `"${brand}" <${process.env.EMAIL_USER}>`,
  to,
  subject,
  html
});

const sendOTPEmail = (email, otp) =>
send(
  email,
  "Your Darnera verification code",
  template(
    "Verify your account",
    `<p>Use this code to continue with your secure login:</p>
    <p style="font-size:36px;letter-spacing:8px;font-weight:bold;color:#342b24;margin:24px 0;">${otp}</p>
    <p style="color:#8c7b6d;font-size:13px;">This code expires in 5 minutes. Please do not share it with anyone.</p>`
  )
);

const sendNewsletterWelcome = (email) =>
send(
  email,
  "Welcome to Darnera",
  template(
    "You're on the list",
    `<p>Thank you for subscribing to Darnera.</p>
    <p>You will now receive our newest fragrances, private releases, and scent stories directly in your inbox.</p>`
  )
);

const sendContactTicket = (email, ticketNumber) =>
send(
  email,
  `Support request received - #${ticketNumber}`,
  template(
    "We've received your request",
    `<p>Thank you for reaching out to us. Your support ticket is <strong>#${ticketNumber}</strong>.</p>
    <p>Our team will review your inquiry and get back to you as soon as possible.</p>`
  )
);

const sendContactResolved = (email, ticketNumber, note) =>
send(
  email,
  `Support ticket resolved - #${ticketNumber}`,
  template(
    "Your support ticket is resolved",
    `<p>Your ticket <strong>#${ticketNumber}</strong> has been marked as resolved by our team.</p>
    ${note ? `<div style="background:#faf7f2;padding:16px;border-radius:8px;margin-top:16px;"><p style="margin:0;"><strong>Update:</strong> ${note}</p></div>` : ""}`
  )
);

const sendOrderConfirmation = (email, order) => {
  const orderId = String(order._id).slice(-8).toUpperCase();
  const total = Number(order.finalAmount || order.totalAmount || 0).toLocaleString("en-IN");
  const address = order.shippingAddress || {};
  const items = (order.products || [])
    .map((item) =>
      `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0eade;color:#342b24;">${item.name || "Product"} <span style="color:#8c7b6d;font-size:12px;">x ${item.quantity || 1}</span></td>
        <td style="padding:12px 0;border-bottom:1px solid #f0eade;text-align:right;color:#342b24;">Rs. ${Number(item.price || 0).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  return send(
    email,
    `Order Confirmed: #${orderId}`,
    template(
      "Thank you for your order",
      `<p>Your Darnera order has been placed successfully. We are preparing it for shipment and will notify you once it's dispatched.</p>
      
      <div style="margin:24px 0;background:#faf7f2;padding:20px;border-radius:12px;border:1px solid #eadfd4;">
        <p style="margin:0 0 16px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;color:#a47b60;">Order #${orderId}</p>
        <table style="width:100%;border-collapse:collapse;margin:0;">
          ${items}
          <tr>
            <td style="padding:16px 0 0 0;font-weight:bold;color:#342b24;">Total</td>
            <td style="padding:16px 0 0 0;text-align:right;font-weight:bold;color:#342b24;">Rs. ${total}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;color:#a47b60;margin-bottom:8px;">Delivery Address</p>
      <p style="margin-top:0;">
        ${address.fullName || ""}<br>
        ${address.address || ""}<br>
        ${address.city || ""}, ${address.state || ""} ${address.pincode || ""}<br>
        Ph: ${address.phone || ""}
      </p>`
    )
  );
};

const sendTrackingUpdate = (email, orderId, trackingLink, courierName) =>
send(
  email,
  `Your order #${orderId} is on its way`,
  template(
    "Your order has shipped",
    `<p>Great news! Your Darnera order <strong>#${orderId}</strong> has been dispatched and is on its way to you.</p>
    <p>It is being shipped securely via <strong>${courierName}</strong>.</p>
    
    <div style="text-align:center;margin-top:32px;">
      <a style="display:inline-block;background:#342b24;color:#ffffff;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;border-radius:8px;text-decoration:none;" href="${trackingLink}">
        Track Package
      </a>
    </div>`
  )
);

// NAYA FUNCTION: Delivered Update Email
const sendOrderDelivered = (email, orderId) =>
send(
  email,
  `Delivered: Your order #${orderId} has arrived`,
  template(
    "Your order is delivered",
    `<p>Your Darnera order <strong>#${orderId}</strong> has been successfully delivered to your address.</p>
    <p>We hope you enjoy experiencing your new fragrance. If you face any issues or have questions, feel free to reply to this email.</p>
    <p style="margin-top:24px;font-family:Georgia, serif;font-style:italic;">Wear it with pride.</p>`
  )
);

const sendOrderCancelled = (email, orderId, reason) =>
send(
  email,
  `Order cancelled: #${orderId}`,
  template(
    "Your order has been cancelled",
    `<p>Your Darnera order <strong>#${orderId}</strong> has been cancelled.</p>${reason ? `<div style="background:#faf7f2;padding:16px;border-radius:8px;margin-top:16px;"><strong>Reason:</strong> ${reason}</div>` : ""}<p style="margin-top:20px;">If you need any help, please contact our support team.</p>`
  )
);

module.exports = {
  sendOTPEmail,
  sendNewsletterWelcome,
  sendContactTicket,
  sendContactResolved,
  sendOrderConfirmation,
  sendTrackingUpdate,
  sendOrderDelivered,
  sendOrderCancelled
};
