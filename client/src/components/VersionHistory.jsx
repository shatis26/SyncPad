import { useState, useEffect } from "react";
import documentService from "../services/documentService";

/**
 * Slide-out panel showing version history for a document.
 * Allows the user to revert to any previous snapshot.
 */
export default function VersionHistory({ documentId, isOpen, onClose, onRevert }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reverting, setReverting] = useState(null);

    useEffect(() => {
        if (isOpen && documentId) {
            fetchVersions();
        }
    }, [isOpen, documentId]);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const data = await documentService.getVersions(documentId);
            setVersions(data);
        } catch (err) {
            console.error("Failed to load versions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRevert = async (versionId) => {
        if (!window.confirm("Revert document to this version? Current content will be saved as a new version first.")) return;
        setReverting(versionId);
        try {
            const updatedDoc = await documentService.revertToVersion(documentId, versionId);
            if (onRevert) onRevert(updatedDoc.content);
            fetchVersions(); // Refresh list
        } catch (err) {
            console.error("Failed to revert:", err);
        } finally {
            setReverting(null);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-80 sm:w-96 glass-card rounded-none rounded-l-2xl z-50 flex flex-col fade-in"
                style={{ borderRight: "none" }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-bold gradient-text">Version History</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-glass hover:bg-glass-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Version list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="spinner" />
                        </div>
                    ) : versions.length === 0 ? (
                        <p className="text-text-muted text-sm text-center py-8">
                            No versions saved yet. <br />
                            Versions are created on auto-save.
                        </p>
                    ) : (
                        versions.map((version, index) => (
                            <div
                                key={version._id}
                                className="p-3 rounded-xl bg-glass border border-border hover:border-primary/40 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-text-primary">
                                            {index === 0 ? "Latest" : `Version ${versions.length - index}`}
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {formatDate(version.createdAt)}
                                        </p>
                                        {version.savedBy && (
                                            <p className="text-xs text-text-secondary mt-1">
                                                by {version.savedBy.name || "Unknown"}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRevert(version._id)}
                                        disabled={reverting === version._id}
                                        className="btn-secondary !py-1.5 !px-3 !text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    >
                                        {reverting === version._id ? "..." : "Revert"}
                                    </button>
                                </div>
                                {/* Content preview */}
                                <p className="text-xs text-text-muted mt-2 line-clamp-2 font-mono">
                                    {version.content?.substring(0, 120) || "(empty)"}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
