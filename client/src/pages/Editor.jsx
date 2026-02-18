import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../services/documentService";
import useSocket from "../hooks/useSocket";
import ActiveUsers from "../components/ActiveUsers";
import VersionHistory from "../components/VersionHistory";
import Navbar from "../components/Navbar";

/**
 * The main collaborative editor page.
 * Uses a textarea for editing and Socket.io for real-time synchronization.
 *
 * KEY DESIGN: To prevent infinite loops, we track whether an incoming change
 * was from a remote user. If so, we update state without re-emitting.
 */
export default function Editor() {
    const { id: documentId } = useParams();
    const [document, setDocument] = useState(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveStatus, setSaveStatus] = useState("saved");
    const [showHistory, setShowHistory] = useState(false);

    // Ref to distinguish local edits from remote updates
    const isRemoteUpdate = useRef(false);
    const saveTimeoutRef = useRef(null);
    const textareaRef = useRef(null);

    // Callback for receiving remote changes via WebSocket
    const handleReceiveChanges = useCallback((remoteContent) => {
        isRemoteUpdate.current = true;
        setContent(remoteContent);
    }, []);

    const { sendChanges, saveDocument, activeUsers, isConnected } = useSocket(
        documentId,
        handleReceiveChanges
    );

    // Fetch document metadata on mount
    useEffect(() => {
        if (!documentId) return;

        const fetchDoc = async () => {
            try {
                const doc = await documentService.getById(documentId);
                setDocument(doc);
                setContent(doc.content || "");
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to load document"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [documentId]);

    /**
     * Handle local text changes.
     * - Emit changes to other users via WebSocket (broadcast).
     * - Debounce auto-save to the database (every 2 seconds of inactivity).
     */
    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);

        // If the change came from the remote update callback, don't re-emit
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        // Broadcast local change to other users immediately
        sendChanges(newContent);

        // Debounced auto-save
        setSaveStatus("unsaved");
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(newContent);
            setSaveStatus("saving");
            // Show "saved" after a short delay to give visual feedback
            setTimeout(() => setSaveStatus("saved"), 600);
        }, 2000);
    };

    // Handle revert from version history
    const handleRevert = (revertedContent) => {
        setContent(revertedContent);
        sendChanges(revertedContent);
        saveDocument(revertedContent);
        setSaveStatus("saved");
    };

    // Copy document ID to clipboard
    const handleCopyId = () => {
        navigator.clipboard.writeText(documentId);
    };

    // Cleanup save timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="glass-card p-8 text-center max-w-md">
                        <p className="text-danger text-lg mb-4">{error}</p>
                        <Link to="/" className="btn-primary inline-block">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Editor Toolbar */}
            <div className="sticky top-16 z-30 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Left: Doc info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <Link
                                to="/"
                                className="text-text-muted hover:text-text-primary transition-colors shrink-0"
                                title="Back to dashboard"
                            >
                                ←
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-text-primary truncate">
                                    {document?.title || "Untitled"}
                                </h1>
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <button
                                        onClick={handleCopyId}
                                        className="font-mono hover:text-primary transition-colors truncate max-w-[160px]"
                                        title="Click to copy document ID"
                                    >
                                        {documentId}
                                    </button>
                                    <span>·</span>
                                    {/* Connection status */}
                                    <span className="flex items-center gap-1">
                                        <span
                                            className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-danger"
                                                }`}
                                        />
                                        {isConnected ? "Connected" : "Disconnected"}
                                    </span>
                                    <span>·</span>
                                    {/* Save status */}
                                    <span
                                        className={
                                            saveStatus === "saved"
                                                ? "text-success"
                                                : saveStatus === "saving"
                                                    ? "text-warning"
                                                    : "text-text-muted"
                                        }
                                    >
                                        {saveStatus === "saved"
                                            ? "✓ Saved"
                                            : saveStatus === "saving"
                                                ? "Saving…"
                                                : "Unsaved changes"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Active users + History */}
                        <div className="flex items-center gap-4">
                            <ActiveUsers users={activeUsers} />
                            <button
                                onClick={() => setShowHistory(true)}
                                className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-1.5"
                            >
                                <span>🕑</span> History
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="glass-card h-full min-h-[calc(100vh-12rem)] p-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Start typing… Your changes will be synced in real time with other collaborators."
                        className="w-full h-full min-h-[calc(100vh-13rem)] resize-none bg-transparent border-none outline-none p-6 text-text-primary text-base leading-relaxed font-mono placeholder:text-text-muted/50"
                        spellCheck={true}
                    />
                </div>
            </div>

            {/* Version History Panel */}
            <VersionHistory
                documentId={documentId}
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onRevert={handleRevert}
            />
        </div>
    );
}
