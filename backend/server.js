const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

dotenv.config();
const app = express();
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    // ✅ dynamically import chalk
    const chalk = await import("chalk");

    console.log(chalk.default.blue("✅ MongoDB connected successfully"));
    app.listen(5000, () =>
      console.log(chalk.default.green("🚀 Server started on port 5000"))
    );
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
