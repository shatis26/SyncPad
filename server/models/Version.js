const mongoose = require("mongoose");

/**
 * Version stores a snapshot of document content at a point in time.
 * Used for version history and revert functionality.
 */
const versionSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
    savedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Version", versionSchema);
