const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
    createDocument,
    getMyDocuments,
    getDocumentById,
    joinDocument,
    getVersions,
    revertToVersion,
} = require("../controllers/documentController");

// All document routes are protected
router.use(protect);

router.post("/", createDocument);
router.get("/", getMyDocuments);
router.get("/:id", getDocumentById);
router.post("/:id/join", joinDocument);
router.get("/:id/versions", getVersions);
router.post("/:id/revert/:versionId", revertToVersion);

module.exports = router;
