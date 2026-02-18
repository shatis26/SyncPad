const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Document = require("../models/Document");
const Version = require("../models/Version");

/**
 * Track which users are currently in each document room.
 * Map<documentId, Map<socketId, { _id, name, email }>>
 */
const activeUsers = new Map();

/**
 * Initialize all Socket.io event handlers.
 * Called once from the main server entry point.
 */
module.exports = (io) => {
    // ── Socket Authentication Middleware ──────────────────────────────────
    // Verify JWT on every new WebSocket connection.
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error – no token"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new Error("Authentication error – user not found"));
            }

            // Attach user data to the socket for later use
            socket.user = { _id: user._id.toString(), name: user.name, email: user.email };
            next();
        } catch (err) {
            next(new Error("Authentication error – invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

        // ── Join a document room ──────────────────────────────────────────
        socket.on("join-document", async (documentId) => {
            // Leave any previous document room
            socket.rooms.forEach((room) => {
                if (room !== socket.id) {
                    socket.leave(room);
                    removeActiveUser(room, socket.id, io);
                }
            });

            socket.join(documentId);

            // Track this user in the active-users map
            if (!activeUsers.has(documentId)) {
                activeUsers.set(documentId, new Map());
            }
            activeUsers.get(documentId).set(socket.id, socket.user);

            // Send the current document content to the joining user
            try {
                const doc = await Document.findById(documentId);
                if (doc) {
                    socket.emit("load-document", doc.content);
                }
            } catch (err) {
                console.error("Error loading document:", err.message);
            }

            // Broadcast updated active-users list to everyone in the room
            broadcastActiveUsers(documentId, io);
        });

        // ── Receive changes from a client and broadcast to others ─────────
        // Using socket.to() sends to everyone in the room EXCEPT the sender,
        // which prevents infinite update loops.
        socket.on("send-changes", (delta) => {
            const rooms = [...socket.rooms].filter((r) => r !== socket.id);
            rooms.forEach((room) => {
                socket.to(room).emit("receive-changes", delta);
            });
        });

        // ── Save document content to the database ─────────────────────────
        socket.on("save-document", async ({ documentId, content }) => {
            try {
                await Document.findByIdAndUpdate(documentId, { content });

                // Create a version snapshot
                await Version.create({
                    documentId,
                    content,
                    savedBy: socket.user._id,
                });

                console.log(`💾 Document ${documentId} saved by ${socket.user.name}`);
            } catch (err) {
                console.error("Error saving document:", err.message);
            }
        });

        // ── Handle cursor position sharing (optional enhancement) ─────────
        socket.on("cursor-move", (data) => {
            const rooms = [...socket.rooms].filter((r) => r !== socket.id);
            rooms.forEach((room) => {
                socket.to(room).emit("cursor-update", {
                    userId: socket.user._id,
                    userName: socket.user.name,
                    ...data,
                });
            });
        });

        // ── Disconnect ────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            console.log(`🔌 User disconnected: ${socket.user.name} (${socket.id})`);
            // Remove from all active-user maps
            socket.rooms.forEach((room) => {
                if (room !== socket.id) {
                    removeActiveUser(room, socket.id, io);
                }
            });
            // Also check all tracked rooms in case Socket already cleared rooms
            activeUsers.forEach((users, docId) => {
                if (users.has(socket.id)) {
                    users.delete(socket.id);
                    broadcastActiveUsers(docId, io);
                }
            });
        });
    });
};

// ── Helpers ─────────────────────────────────────────────────────────────

function removeActiveUser(documentId, socketId, io) {
    const users = activeUsers.get(documentId);
    if (users) {
        users.delete(socketId);
        if (users.size === 0) {
            activeUsers.delete(documentId);
        } else {
            broadcastActiveUsers(documentId, io);
        }
    }
}

function broadcastActiveUsers(documentId, io) {
    const users = activeUsers.get(documentId);
    if (users) {
        const userList = [...users.values()];
        io.to(documentId).emit("active-users", userList);
    }
}
