const mongoose = require("mongoose");

const DocumentSchema = mongoose.Schema({
    name: String,
    type: String,
    size: Number,
    chunks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chunks' }],
});

const Documents = mongoose.model('documents', DocumentSchema);
module.exports = Documents;
