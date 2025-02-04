const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chunks = require("../models/chunks");
// const { generateEmbedding } = require("../utils/embeddings");
const axios = require("axios");
const dotenv = require("dotenv");
// const cosineSimilarity = require("compute-cosine-similarity");

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const answerQuestion = async (req, res) => {
  try {
    const { documentIds, question } = req.body;

    if (!documentIds || !question) {
      return res.status(400).json({ error: "Document IDs and question are required" });
    }

    const chunks = await Chunks.find({ documentId: { $in: documentIds } });

    if (!chunks.length) {
      return res.status(404).json({ error: "No relevant data found in selected documents." });
    }

    const relevantChunks = chunks.slice(0, 5).map((chunk) => chunk.text);

    const prompt = `Use the following information to answer the question: "${question}". Relevant Information: ${relevantChunks.join(" ")}. Answer only using the provided information.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    res.json({
      success: true,
      answer: answer || "Failed to generate an answer.",
      relevantChunks: relevantChunks.length,
    });
  } catch (error) {
    console.error("Error in answerQuestion:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process question",
    });
  }
};

module.exports = { answerQuestion };
