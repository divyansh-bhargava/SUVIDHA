const express = require("express");
const prisma = require("../config/db");
const { authCitizen } = require("../middleware/auth");
const { generateTicketId } = require("../utils/generateId");

const router = express.Router();

// All complaint routes require citizen auth
router.use(authCitizen);

// Valid complaint types per department
const COMPLAINT_TYPES = {
  electricity: ["Power Outage", "Voltage Fluctuation", "Billing Issue", "Meter Problem", "Illegal Connection", "Other"],
  water: ["No Water Supply", "Low Pressure", "Water Quality", "Leakage", "Billing Issue", "Meter Problem", "Other"],
  gas: ["No Gas Supply", "Leakage", "Billing Issue", "Meter Problem", "Other"],
  municipal: ["Road Damage", "Garbage Collection", "Street Light", "Drainage", "Encroachment", "Other"],
};

// ─── POST /api/complaints ────────────────────────────────
// Register a new complaint
router.post("/", async (req, res) => {
  try {
    const { department, type, description } = req.body;

    if (!department || !type || !description) {
      return res.status(400).json({ error: "department, type, and description are required" });
    }

    if (!COMPLAINT_TYPES[department]) {
      return res.status(400).json({
        error: "Invalid department. Must be one of: " + Object.keys(COMPLAINT_TYPES).join(", "),
      });
    }

    if (!COMPLAINT_TYPES[department].includes(type)) {
      return res.status(400).json({
        error: "Invalid complaint type for " + department + ". Valid types: " + COMPLAINT_TYPES[department].join(", "),
      });
    }

    if (description.length > 500) {
      return res.status(400).json({ error: "Description must be 500 characters or less" });
    }

    const ticketId = generateTicketId("TKT");

    const complaint = await prisma.complaint.create({
      data: {
        ticketId,
        citizenId: req.citizen.id,
        department,
        type,
        description: description.trim(),
      },
    });

    return res.status(201).json({
      message: "Complaint registered successfully",
      ticketId: complaint.ticketId,
      id: complaint.id,
      status: complaint.status,
      department: complaint.department,
      type: complaint.type,
      createdAt: complaint.createdAt,
    });
  } catch (err) {
    console.error("Create complaint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/complaints ─────────────────────────────────
// List all complaints for the logged-in citizen
router.get("/", async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { citizenId: req.citizen.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json(
      complaints.map((c) => ({
        id: c.id,
        ticketId: c.ticketId,
        department: c.department,
        type: c.type,
        description: c.description,
        status: c.status,
        remarks: c.remarks,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        resolvedAt: c.resolvedAt,
      }))
    );
  } catch (err) {
    console.error("List complaints error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/complaints/:ticketId ───────────────────────
// Track a complaint by ticket ID
router.get("/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { ticketId },
      include: {
        citizen: {
          select: { name: true, suvidhaId: true, phone: true },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found. Format: TKT-XXXXXXXX" });
    }

    // Citizens can only see their own complaints
    if (complaint.citizenId !== req.citizen.id) {
      return res.status(403).json({ error: "Not authorized to view this complaint" });
    }

    // Build a status timeline
    const timeline = [
      { step: "Complaint Filed", date: complaint.createdAt, done: true },
      {
        step: "Under Review",
        date: complaint.status !== "pending" ? complaint.updatedAt : null,
        done: ["processing", "resolved", "rejected"].includes(complaint.status),
      },
      {
        step: complaint.status === "rejected" ? "Rejected" : "Resolved",
        date: complaint.resolvedAt,
        done: ["resolved", "rejected"].includes(complaint.status),
      },
    ];

    return res.json({
      id: complaint.id,
      ticketId: complaint.ticketId,
      department: complaint.department,
      type: complaint.type,
      description: complaint.description,
      status: complaint.status,
      remarks: complaint.remarks,
      citizen: complaint.citizen,
      timeline,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      resolvedAt: complaint.resolvedAt,
    });
  } catch (err) {
    console.error("Track complaint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/complaints/types/:department ───────────────
// Get valid complaint types for a department
router.get("/types/:department", async (req, res) => {
  const { department } = req.params;
  const types = COMPLAINT_TYPES[department];

  if (!types) {
    return res.status(400).json({
      error: "Invalid department. Must be one of: " + Object.keys(COMPLAINT_TYPES).join(", "),
    });
  }

  return res.json({ department, types });
});

module.exports = router;
