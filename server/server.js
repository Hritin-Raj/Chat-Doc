const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const { connectDB } = require("./config/db");
const documentRoutes = require("./routes/documentRoutes");
const qaRoutes = require("./routes/qaRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
connectDB(MONGO_URI);

// Serve the uploads folder as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// Routes
app.use("/api/documents", documentRoutes);
app.use("/api/qa", qaRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
