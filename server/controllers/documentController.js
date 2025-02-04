const Documents = require("../models/documents");
const Chunks = require("../models/chunks");
const { chunkText } = require("../utils/textProcessor");
const { generateEmbedding } = require("../utils/embeddings");
const fs = require("fs");
const pdfParse = require('pdf-parse');

const uploadDocuments = async (req, res) => {
    console.log("[uploadDocuments] Starting document upload process");
    const uploadedFiles = [];

    try {
        console.log("[uploadDocuments] Checking uploaded files...");
        if (!req.files || req.files.length === 0) {
            console.log("[uploadDocuments] Error: No files found in request");
            return res.status(400).json({ error: "No files uploaded" });
        }
        console.log(`[uploadDocuments] Found ${req.files.length} files to process`);

        const uploadedDocs = [];

        for (const file of req.files) {
            uploadedFiles.push(file);
            console.log(`[uploadDocuments] Processing file: ${file.originalname}`);
            let text = "";
            const filePath = file.path;

            console.log(`[uploadDocuments] File type: ${file.mimetype}`);
            if (file.mimetype === "application/pdf") {
                try {
                    console.log("[uploadDocuments] Reading PDF file...");
                    const dataBuffer = fs.readFileSync(filePath);
                    
                    console.log("[uploadDocuments] Parsing PDF content...");
                    const pdfData = await pdfParse(dataBuffer);
                    
                    text = pdfData.text;
                    if (!text || text.length === 0) {
                        throw new Error("No text content extracted from PDF");
                    }
                    console.log(`[uploadDocuments] PDF parsed successfully. Extracted ${text.length} characters`);
                    
                } catch (pdfError) {
                    console.error("[uploadDocuments] PDF processing error:", pdfError);
                    throw new Error(`PDF processing failed: ${pdfError.message}`);
                }

            } else if (file.mimetype === "text/plain") {
                console.log("[uploadDocuments] Reading text file...");
                text = fs.readFileSync(filePath, "utf-8");
                console.log("[uploadDocuments] Text file read successfully");
            } else {
                console.log(`[uploadDocuments] Skipping unsupported file type: ${file.mimetype}`);
                continue;
            }

            let document;
            try {
                // Create document entry
                console.log("[uploadDocuments] Creating document entry in MongoDB...");
                document = await Documents.create({
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                });
                console.log(`[uploadDocuments] Document created with ID: ${document._id}`);

                // Process chunks
                console.log("[uploadDocuments] Starting text chunking process...");
                const chunks = chunkText(text);
                console.log(`[uploadDocuments] Created ${chunks.length} chunks`);

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    console.log(`[uploadDocuments] Processing chunk ${i + 1}/${chunks.length}`);
                    
                    console.log("[uploadDocuments] Generating embedding...");
                    let embedding;
                    try {
                        embedding = await generateEmbedding(chunk);
                        console.log("[uploadDocuments] Embedding generated successfully");
                    } catch (embeddingError) {
                        console.error("[uploadDocuments] Embedding generation failed:", embeddingError);
                        // If document was created, delete it since we couldn't process it completely
                        if (document) {
                            await Documents.findByIdAndDelete(document._id);
                            await Chunks.deleteMany({ documentId: document._id });
                        }
                        throw new Error(`Failed to generate embedding: ${embeddingError.message}`);
                    }

                    console.log("[uploadDocuments] Creating chunk document...");
                    const chunkDoc = await Chunks.create({ 
                        documentId: document._id, 
                        text: chunk, 
                        embedding 
                    });
                    console.log(`[uploadDocuments] Chunk document created with ID: ${chunkDoc._id}`);

                    console.log("[uploadDocuments] Saving chunk...");
                    await chunkDoc.save();
                    
                    console.log("[uploadDocuments] Adding chunk to document's chunks array");
                    document.chunks.push(chunkDoc._id);
                }

                console.log("[uploadDocuments] Saving document with updated chunks...");
                await document.save();
                console.log("[uploadDocuments] Document saved successfully");

                uploadedDocs.push({ 
                    documentId: document._id, 
                    name: file.originalname,
                    textLength: text.length,
                    chunksCount: chunks.length
                });
                console.log(`[uploadDocuments] Added ${file.originalname} to uploaded docs list`);
            } catch (documentError) {
                console.error("[uploadDocuments] Error processing document:", documentError);
                // Clean up any partial document data if there was an error
                if (document) {
                    await Documents.findByIdAndDelete(document._id);
                    await Chunks.deleteMany({ documentId: document._id });
                }
                throw documentError;
            }
        }

        console.log("[uploadDocuments] All documents processed successfully");
        res.json({ 
            message: "Documents processed successfully", 
            documents: uploadedDocs 
        });
    } catch (error) {
        console.error("[uploadDocuments] Fatal error:", error);
        res.status(500).json({ 
            error: "Document processing failed", 
            details: error.message 
        });
    } finally {
        // Clean up temporary files
        for (const file of uploadedFiles) {
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log(`[uploadDocuments] Cleaned up file: ${file.path}`);
                }
            } catch (err) {
                console.error(`[uploadDocuments] Error cleaning up file ${file.path}:`, err);
            }
        }
    }
};

module.exports = { uploadDocuments };