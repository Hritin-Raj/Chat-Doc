import Chunks from "../models/chunks.js";
import { generateEmbedding } from "../utils/embeddings.js";
import axios from "axios";
import dotenv from "dotenv";
import cosineSimilarity from "compute-cosine-similarity";

dotenv.config();

const HF_API_KEY = process.env.HUGGING_FACE_TOKEN;

export const answerQuestion = async (req, res) => {
    try {
        const { documentIds, question } = req.body;

        if (!documentIds || !question) {
            return res.status(400).json({ error: 'Document IDs and question are required' });
        }

        // Generate question embedding
        const questionEmbedding = await generateEmbedding(question);

        // Fetch chunks from all selected documents
        const chunks = await Chunks.find({ documentId: { $in: documentIds } });

        if (!chunks.length) {
            return res.status(404).json({ error: "No relevant data found in selected documents." });
        }

        // Find most relevant chunks
        let scores = chunks.map(chunk => ({
            text: chunk.text,
            score: cosineSimilarity(questionEmbedding, chunk.embedding),
        }));

        // Sort chunks by relevance
        scores.sort((a, b) => b.score - a.score);

        // Get top 5 most relevant chunks (can be adjusted)
        const relevantChunks = scores.slice(0, 5).map(chunk => chunk.text);

        // Construct prompt
        const prompt = `
        Use the following information to answer the question: "${question}"
        Relevant Information:
        ${relevantChunks.join("\n\n")}
        `;

        // Call Hugging Face API for answer generation
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
        );

        const answer = response.data.generated_text || "No relevant information found.";

        res.json({ answer });

    } catch (error) {
        console.error("Error in answerQuestion:", error);
        res.status(500).json({ error: error.message });
    }
};
