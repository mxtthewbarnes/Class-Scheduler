// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const courseRouter = require("./routes/courseRouter");
const db = require("./config/db"); // <-- import db so we can run SQL

const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/courses", courseRouter);

app.get("/", (_req, res) => {
  res.send("Backend API is running");
});

app.get("/whoami", (_req, res) => {
  res.send("server.js is running");
});

// ---- DB init + start server ----
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        instructor TEXT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        days TEXT NOT NULL
      );
    `);

    console.log("Ensured 'courses' table exists");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
})();