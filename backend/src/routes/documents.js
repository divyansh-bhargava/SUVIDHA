const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const prisma = require("../config/db");
const { authCitizen } = require("../middleware/auth");

const router = express.Router();

// ─── Multer storage config (local dev) ───────────────────
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, PNG, and WebP files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// All document routes require citizen auth
router.use(authCitizen);

// ─── POST /api/documents/upload ──────────────────────────
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, type, expiryDate } = req.body;

    if (!name || !type) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "name and type are required" });
    }

    const validTypes = [
      "identity", "address", "property", "income",
      "noc", "birth_record", "death_record", "tax", "other",
    ];
    if (!validTypes.includes(type)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Invalid type. Must be one of: " + validTypes.join(", "),
      });
    }

    const doc = await prisma.document.create({
      data: {
        citizenId: req.citizen.id,
        name,
        type,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        status: "pending", // Will be verified by admin or AI later
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        fileName: doc.fileName,
        status: doc.status,
        uploadDate: doc.uploadDate,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/documents ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { citizenId: req.citizen.id },
      orderBy: { uploadDate: "desc" },
    });

    return res.json(
      documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        fileName: d.fileName,
        status: d.status,
        uploadDate: d.uploadDate,
        expiryDate: d.expiryDate,
        lastUsed: d.lastUsed,
      }))
    );
  } catch (err) {
    console.error("List documents error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/documents/:id ───────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (doc.citizenId !== req.citizen.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete file from disk
    if (fs.existsSync(doc.fileUrl)) {
      fs.unlinkSync(doc.fileUrl);
    }

    await prisma.document.delete({ where: { id } });

    return res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete document error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
