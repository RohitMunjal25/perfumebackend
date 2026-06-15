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
module.exports = app;