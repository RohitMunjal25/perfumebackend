const express = require("express");
const cors = require("cors");

const authRoutes =
require("./routes/authRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Backend Running"
  });

});
const productRoutes =
require("./routes/productRoutes");

app.use(
 "/api/products",
 productRoutes
);
const paymentRoutes =
require("./routes/paymentRoutes");

app.use(
 "/api/payment",
 paymentRoutes
);  

const orderRoutes =
require("./routes/orderRoutes");

app.use(
 "/api/orders",
 orderRoutes
);

const couponRoutes =
require("./routes/couponRoutes");

app.use(
 "/api/coupons",
 couponRoutes
);

const contactRoutes =
require("./routes/contactRoutes");

app.use(
 "/api/contact",
 contactRoutes
);

const newsletterRoutes =
require("./routes/newsletterRoutes");

app.use(
 "/api/newsletter",
 newsletterRoutes
);

module.exports = app;
