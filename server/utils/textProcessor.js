const natural = require("natural");

// Load the tokenizer
const tokenizer = new natural.SentenceTokenizer();

/**
 * Splits text into efficiently sized chunks.
 * @param {string} text - The input text.
 * @param {number} maxTokens - Maximum tokens per chunk.
 * @returns {string[]} - Array of text chunks.
 */
const chunkText = (text, maxTokens = 200) => {
    const sentences = tokenizer.tokenize(text); // Tokenize into sentences
    let chunks = [], currentChunk = [];
    let tokenCount = 0;

    sentences.forEach((sentence) => {
        let words = sentence.split(" ");
        if (tokenCount + words.length > maxTokens) {
            chunks.push(currentChunk.join(" "));
            currentChunk = [];
            tokenCount = 0;
        }
        currentChunk.push(sentence);
        tokenCount += words.length;
    });

    if (currentChunk.length) chunks.push(currentChunk.join(" "));
    return chunks;
};

module.exports = {chunkText};