const mongoose = require("mongoose");

const ChunkSchema = mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'documents' },
    text: String,
    embedding: [Number], // Store vector embeddings
});

const Chunks = mongoose.model('chunks', ChunkSchema);
module.exports = Chunks;