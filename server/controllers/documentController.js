import Documents from "../models/documents.js";
import Chunks from "../models/chunks.js";
import { chunkText } from "../utils/textProcessor.js";
import { generateEmbedding } from "../utils/embeddings.js";
import fs from "fs";
import { PDFDocument } from "pdf-lib";

export const uploadDocuments = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        const uploadedDocs = [];

        for (const file of req.files) {
            let text = "";
            const filePath = file.path;

            if (file.mimetype === "application/pdf") {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfDoc = await PDFDocument.load(dataBuffer);

                // Extract text from each page
                for (const page of pdfDoc.getPages()) {
                    text += page.getTextContent() + '\n';
                }

            } else if (file.mimetype === "text/plain") {
                text = fs.readFileSync(filePath, "utf-8");
            } else {
                continue; // Skip unsupported file types
            }

            // Create document entry in MongoDB
            const document = await Documents.create({
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
            });

            // Process document into chunks
            const chunks = chunkText(text);
            for (const chunk of chunks) {
                const embedding = await generateEmbedding(chunk);
                const chunkDoc = await Chunks.create({ documentId: document._id, text: chunk, embedding });
                document.chunks.push(chunkDoc._id);
            }

            await document.save();
            uploadedDocs.push({ documentId: document._id, name: file.originalname });
        }

        res.json({ message: "Documents processed successfully", documents: uploadedDocs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
