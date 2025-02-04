import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

import { connectDB } from "./config/db.js";
import documentRoutes from "./routes/documentRoutes.js";
import qaRoutes from "./routes/qaRoutes.js";

const app = express();
console.log("MongoDB URI:", process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
// connectDB(`${MONGO_URI}`);
connectDB("mongodb://localhost:27017/chat-doc-db");

// Serve the uploads folder as static
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/qa', qaRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
