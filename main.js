
require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// Import separate route files
app.use("/user", require("./routes/user"));
app.use("/client", require("./routes/client"));
app.use("/project", require("./routes/project"));
app.use("/task", require("./routes/task"));
app.use("/ocr", require("./routes/ocr"));


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("API Error:", error);

  if (error.code === "P2002") {
    return res.status(409).json({
      message: "A unique value such as email or phone already exists",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      message: "Foreign key constraint failed",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  if (error.code === "P2023") {
    return res.status(400).json({
      message: "Invalid database ID format",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
