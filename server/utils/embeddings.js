import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.HUGGING_FACE_TOKEN;



export const generateEmbedding = async (text) => {
  try {
    const model = "sentence-transformers/all-MiniLM-L6-v2";
    const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

    const response = await axios.post(url, 
      { inputs: text }, 
      { headers: { Authorization: `Bearer ${HF_API_KEY}` }
    });

    return response.data[0]; // Embedding result
  } catch (error) {
    console.error("Error generating embedding:", error.message);
  }
};
// console.log("p")
// generateEmbedding("Hello world").then((embedding) => console.log(embedding));