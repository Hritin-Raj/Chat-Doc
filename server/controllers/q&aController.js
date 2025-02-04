const Chunks = require("../models/chunks");
const { generateEmbedding } = require("../utils/embeddings");
const axios = require("axios");
const dotenv = require("dotenv");
const cosineSimilarity = require("compute-cosine-similarity");

dotenv.config();

const HF_API_KEY = process.env.HUGGING_FACE_TOKEN;

// Helper function to ensure embedding is an array
const normalizeEmbedding = (embedding) => {
    if (!Array.isArray(embedding)) {
        // If it's a single number, convert to array
        return [embedding];
    }
    return embedding;
};

// Helper function to calculate similarity safely
const calculateSimilarity = (embedding1, embedding2) => {
    try {
        const norm1 = normalizeEmbedding(embedding1);
        const norm2 = normalizeEmbedding(embedding2);
        
        // Ensure both embeddings have the same length
        if (norm1.length !== norm2.length) {
            console.warn("Embedding dimensions don't match:", norm1.length, norm2.length);
            return 0;
        }
        
        return cosineSimilarity(norm1, norm2);
    } catch (error) {
        console.error("Error calculating similarity:", error);
        return 0;
    }
};

const answerQuestion = async (req, res) => {
    try {
        const { documentIds, question } = req.body;

        if (!documentIds || !question) {
            return res.status(400).json({ error: 'Document IDs and question are required' });
        }

        // Generate question embedding
        const questionEmbedding = await generateEmbedding(question);
        if (!questionEmbedding) {
            throw new Error("Failed to generate question embedding");
        }

        // Fetch chunks from all selected documents
        const chunks = await Chunks.find({ documentId: { $in: documentIds } });

        if (!chunks.length) {
            return res.status(404).json({ error: "No relevant data found in selected documents." });
        }

        // Find most relevant chunks with error handling
        let scores = chunks.map(chunk => {
            const similarity = calculateSimilarity(questionEmbedding, chunk.embedding);
            return {
                text: chunk.text,
                score: similarity,
            };
        }).filter(item => !isNaN(item.score)); // Remove any invalid similarities

        // Sort chunks by relevance
        scores.sort((a, b) => b.score - a.score);

        // Get top 5 most relevant chunks
        const relevantChunks = scores.slice(0, 5).map(chunk => chunk.text);

        // Construct prompt
        const prompt = `
        Use the following information to answer the question: "${question}"
        Relevant Information:
        ${relevantChunks.join("\n\n")}
        
        Answer the question based only on the provided information. If the information is not sufficient, say so.
        `;

        // Call Hugging Face API for answer generation
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
            { inputs: prompt },
            { 
                headers: { Authorization: `Bearer ${HF_API_KEY}` },
                timeout: 30000 // 30 second timeout
            }
        );

        const answer = response.data[0]?.generated_text || "Failed to generate an answer.";

        res.json({ 
            success: true,
            answer,
            relevantChunks: relevantChunks.length
        });

    } catch (error) {
        console.error("Error in answerQuestion:", error);
        res.status(500).json({ 
            success: false,
            error: error.message || "Failed to process question"
        });
    }
};

module.exports = { answerQuestion };