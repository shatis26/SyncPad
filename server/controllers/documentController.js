const Document = require("../models/Document");
const Version = require("../models/Version");

/**
 * POST /api/documents
 * Create a new document. The requesting user becomes the owner.
 */
exports.createDocument = async (req, res) => {
    try {
        const { title } = req.body;

        const doc = await Document.create({
            title: title || "Untitled Document",
            content: "",
            owner: req.user._id,
            collaborators: [req.user._id], // Owner is always a collaborator
        });

        // Populate owner info before returning
        await doc.populate("owner", "name email");
        await doc.populate("collaborators", "name email");

        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/documents
 * Get all documents where the user is owner OR collaborator.
 */
exports.getMyDocuments = async (req, res) => {
    try {
        const docs = await Document.find({
            $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
        })
            .populate("owner", "name email")
            .populate("collaborators", "name email")
            .sort({ updatedAt: -1 });

        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/documents/:id
 * Get a single document by ID. User must be owner or collaborator.
 */
exports.getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
            .populate("owner", "name email")
            .populate("collaborators", "name email");

        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Check access: user must be owner or collaborator
        const userId = req.user._id.toString();
        const isOwner = doc.owner._id.toString() === userId;
        const isCollaborator = doc.collaborators.some(
            (c) => c._id.toString() === userId
        );

        if (!isOwner && !isCollaborator) {
            return res
                .status(403)
                .json({ message: "Access denied – you are not a collaborator" });
        }

        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/documents/:id/join
 * Add the requesting user as a collaborator on the document.
 */
exports.joinDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Avoid duplicate collaborator entries
        const userId = req.user._id.toString();
        const alreadyCollaborator = doc.collaborators.some(
            (c) => c.toString() === userId
        );

        if (!alreadyCollaborator) {
            doc.collaborators.push(req.user._id);
            await doc.save();
        }

        await doc.populate("owner", "name email");
        await doc.populate("collaborators", "name email");

        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/documents/:id/versions
 * Get all version snapshots for a document, newest first.
 */
exports.getVersions = async (req, res) => {
    try {
        const versions = await Version.find({ documentId: req.params.id })
            .populate("savedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/documents/:id/revert/:versionId
 * Revert document content to a specific version snapshot.
 */
exports.revertToVersion = async (req, res) => {
    try {
        const { id, versionId } = req.params;

        const version = await Version.findById(versionId);
        if (!version || version.documentId.toString() !== id) {
            return res.status(404).json({ message: "Version not found" });
        }

        const doc = await Document.findById(id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Create a new version snapshot of the CURRENT content before reverting
        await Version.create({
            documentId: id,
            content: doc.content,
            savedBy: req.user._id,
        });

        // Revert document content
        doc.content = version.content;
        await doc.save();

        await doc.populate("owner", "name email");
        await doc.populate("collaborators", "name email");

        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
