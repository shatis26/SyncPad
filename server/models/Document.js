const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Document title is required"],
            trim: true,
            maxlength: 200,
            default: "Untitled Document",
        },
        content: {
            type: String,
            default: "",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        collaborators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
