import express from "express";
import upload from "../middlewares/multer.js";
import { uploadDocuments } from "../controllers/documentController.js";

const router = express.Router();

// Upload and process multiple documents
router.post("/upload", upload.array("documents", 10), uploadDocuments);

export default router;
