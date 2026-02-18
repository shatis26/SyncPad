require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

// Socket handler import
const initializeSocket = require("./sockets/documentSocket");

// ── App Setup ──────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── CORS ───────────────────────────────────────────────────────────────
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ── Body Parsers ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── REST Routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Health-check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Socket.io ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

initializeSocket(io);

// ── Start Server ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
