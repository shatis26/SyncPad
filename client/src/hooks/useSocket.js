import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import authService from "../services/authService";

const SOCKET_URL = "http://localhost:5000";

/**
 * Custom hook that manages the Socket.io connection for a document.
 *
 * @param {string} documentId - The document ID to join.
 * @param {function} onReceiveChanges - Callback fired when another user sends content changes.
 * @returns {{ sendChanges, saveDocument, activeUsers, isConnected }}
 */
export default function useSocket(documentId, onReceiveChanges) {
    const socketRef = useRef(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!documentId) return;

        const token = authService.getToken();
        if (!token) return;

        // Create socket connection with JWT auth
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            // Join the document room
            socket.emit("join-document", documentId);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        // Receive the initial document content when joining
        socket.on("load-document", (content) => {
            if (onReceiveChanges) {
                onReceiveChanges(content);
            }
        });

        // Receive real-time changes from OTHER users
        socket.on("receive-changes", (content) => {
            if (onReceiveChanges) {
                onReceiveChanges(content);
            }
        });

        // Receive updated list of active users in the document
        socket.on("active-users", (users) => {
            setActiveUsers(users);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        // Cleanup on unmount or when documentId changes
        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setActiveUsers([]);
        };
    }, [documentId]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Emit content changes to other users in the room.
     * Called on every keystroke (debounced in the editor component).
     */
    const sendChanges = useCallback((content) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("send-changes", content);
        }
    }, []);

    /**
     * Persist the document content to the database via WebSocket.
     */
    const saveDocument = useCallback(
        (content) => {
            if (socketRef.current?.connected && documentId) {
                socketRef.current.emit("save-document", {
                    documentId,
                    content,
                });
            }
        },
        [documentId]
    );

    return { sendChanges, saveDocument, activeUsers, isConnected };
}
