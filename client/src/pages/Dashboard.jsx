import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import documentService from "../services/documentService";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [joinId, setJoinId] = useState("");
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const docs = await documentService.getAll();
            setDocuments(docs);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError("");
        try {
            const doc = await documentService.create(newTitle || "Untitled Document");
            setNewTitle("");
            navigate(`/editor/${doc._id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create document");
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!joinId.trim()) return;
        setJoining(true);
        setError("");
        try {
            await documentService.join(joinId.trim());
            navigate(`/editor/${joinId.trim()}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join document. Check the ID.");
        } finally {
            setJoining(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="fade-in">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold gradient-text">Your Documents</h1>
                        <p className="text-text-secondary mt-1">
                            Create, join, and manage your collaborative documents
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        {/* Create Document */}
                        <form onSubmit={handleCreate} className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <span className="text-xl">📝</span> New Document
                            </h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Document title…"
                                    className="input-field flex-1"
                                />
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="btn-primary shrink-0"
                                >
                                    {creating ? "…" : "Create"}
                                </button>
                            </div>
                        </form>

                        {/* Join Document */}
                        <form onSubmit={handleJoin} className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <span className="text-xl">🤝</span> Join by ID
                            </h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    placeholder="Paste document ID…"
                                    className="input-field flex-1 font-mono text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={joining || !joinId.trim()}
                                    className="btn-primary shrink-0"
                                >
                                    {joining ? "…" : "Join"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Document List */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="spinner" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-16 glass-card">
                            <p className="text-5xl mb-4">📄</p>
                            <p className="text-text-secondary text-lg">
                                No documents yet. Create one to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc._id}
                                    onClick={() => navigate(`/editor/${doc._id}`)}
                                    className="glass-card p-5 cursor-pointer hover:border-primary/50 transition-all hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-base font-semibold text-text-primary truncate flex-1 group-hover:text-primary-light transition-colors">
                                            {doc.title}
                                        </h3>
                                        <span className="text-xs text-text-muted shrink-0 ml-2">
                                            →
                                        </span>
                                    </div>

                                    <p className="text-xs text-text-muted line-clamp-2 mb-3 font-mono min-h-[2rem]">
                                        {doc.content?.substring(0, 100) || "Empty document"}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-text-muted">
                                        <span className="flex items-center gap-1">
                                            👤 {doc.collaborators?.length || 0} collaborator{doc.collaborators?.length !== 1 ? "s" : ""}
                                        </span>
                                        <span>{formatDate(doc.updatedAt)}</span>
                                    </div>

                                    {/* Document ID – small, for sharing */}
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p
                                            className="text-[10px] text-text-muted font-mono truncate"
                                            title={`ID: ${doc._id}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(doc._id);
                                            }}
                                        >
                                            ID: {doc._id}{" "}
                                            <span className="text-primary cursor-pointer hover:underline">
                                                copy
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
