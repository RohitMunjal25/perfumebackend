require("dotenv").config();

const app = require("./src/app");

const connectDB = require("./src/config/db");

connectDB();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "FOUND" : "MISSING");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On ${PORT}`);
});