const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const HF_API_KEY = process.env.HUGGING_FACE_TOKEN;

// Validate API key before making requests
const validateApiKey = () => {
    if (!HF_API_KEY) {
        throw new Error("HUGGING_FACE_TOKEN is not configured in environment variables");
    }
};

const generateEmbedding = async (text) => {
    try {
        // Validate API key first
        validateApiKey();

        const model = "sentence-transformers/all-MiniLM-L6-v2";
        const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

        const response = await axios.post(
            url, 
            { inputs: text }, 
            { 
                headers: { 
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.data || !response.data[0]) {
            throw new Error("Invalid response from Hugging Face API");
        }

        return response.data[0]; // Embedding result
    } catch (error) {
        if (error.response) {
            // Handle specific HTTP errors
            switch (error.response.status) {
                case 401:
                    throw new Error("Invalid Hugging Face API token. Please check your HUGGING_FACE_TOKEN environment variable.");
                case 429:
                    throw new Error("Too many requests to Hugging Face API. Please try again later.");
                default:
                    throw new Error(`Hugging Face API error: ${error.response.status} - ${error.response.data.error || error.message}`);
            }
        }
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

module.exports = { generateEmbedding };