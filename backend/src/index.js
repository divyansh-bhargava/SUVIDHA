require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const citizenRoutes = require("./routes/citizen");
const complaintRoutes = require("./routes/complaints");
const documentRoutes = require("./routes/documents");
const adminRoutes = require("./routes/admin");
const electricityRoutes = require("./routes/electricity");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:8080", "http://localhost:5173"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (dev only — in production use NIC Vikram S3)
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads")));

// ─── Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/electricity", electricityRoutes);

// ─── Health Check ───────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SUVIDHA API] Server running on http://localhost:${PORT}`);
  console.log(`[SUVIDHA API] Environment: ${process.env.NODE_ENV || "development"}`);
});
