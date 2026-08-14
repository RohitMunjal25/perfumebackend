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

// NAYA LIGHT THEME TEMPLATE
const template = (title, body) =>
`<div style="background:#f7f5f0;padding:40px 20px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;color:#3a3029;">
  <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:16px;border:1px solid #eadfd4;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.03);">
    
    <div style="padding:32px;background:#fffdfa;border-bottom:1px solid #eadfd4;text-align:center;font-size:28px;letter-spacing:4px;color:#342b24;font-family:Georgia, serif;text-transform:uppercase;">
      ${brand}
    </div>
    
    <div style="padding:40px 32px">
      <h2 style="margin-top:0;font-family:Georgia, serif;font-weight:normal;font-size:22px;color:#342b24;">${title}</h2>
      <div style="font-size:15px;line-height:1.6;color:#5c4e43;">
        ${body}
      </div>
    </div>
    
    <div style="padding:24px 32px;color:#9a8b7e;font-size:12px;background:#faf7f2;text-align:center;border-top:1px solid #eadfd4;">
      © ${new Date().getFullYear()} ${brand}. The Scent of Authority.
    </div>
    
  </div>
</div>`;

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

module.exports = {
  sendOTPEmail,
  sendNewsletterWelcome,
  sendContactTicket,
  sendContactResolved,
  sendOrderConfirmation,
  sendTrackingUpdate,
  sendOrderDelivered // <- Export karna mat bhoolna
};