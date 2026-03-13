const express = require("express");
const prisma = require("../config/db");
const { authAdmin } = require("../middleware/auth");

const router = express.Router();

// All admin routes require admin auth
router.use(authAdmin);

// ─── GET /api/admin/complaints ───────────────────────────
// List all complaints (filterable by department, status)
router.get("/complaints", async (req, res) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;

    const where = {};

    // Department admins/staff can only see their department
    if (req.admin.role !== "master") {
      where.department = req.admin.department;
    } else if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          citizen: {
            select: { name: true, suvidhaId: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.complaint.count({ where }),
    ]);

    return res.json({
      data: complaints.map((c) => ({
        id: c.id,
        ticketId: c.ticketId,
        department: c.department,
        type: c.type,
        description: c.description,
        status: c.status,
        remarks: c.remarks,
        citizen: c.citizen,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Admin list complaints error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/complaints/:id ─────────────────────
// Update complaint status (processing, resolved, rejected)
router.patch("/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ["processing", "resolved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "status is required. Must be one of: " + validStatuses.join(", "),
      });
    }

    if (status === "rejected" && !remarks) {
      return res.status(400).json({ error: "remarks are required when rejecting" });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Department admin/staff can only update their department's complaints
    if (req.admin.role !== "master" && complaint.department !== req.admin.department) {
      return res.status(403).json({ error: "Not authorized for this department" });
    }

    const updateData = {
      status,
      remarks: remarks || complaint.remarks,
    };

    if (status === "resolved" || status === "rejected") {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      message: "Complaint updated successfully",
      id: updated.id,
      ticketId: updated.ticketId,
      status: updated.status,
      remarks: updated.remarks,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error("Admin update complaint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/stats ────────────────────────────────
// Department statistics
router.get("/stats", async (req, res) => {
  try {
    const department = req.admin.role === "master" ? req.query.department : req.admin.department;

    const where = department ? { department } : {};

    const [total, pending, processing, resolved, rejected, todayApproved] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.count({ where: { ...where, status: "pending" } }),
      prisma.complaint.count({ where: { ...where, status: "processing" } }),
      prisma.complaint.count({ where: { ...where, status: "resolved" } }),
      prisma.complaint.count({ where: { ...where, status: "rejected" } }),
      prisma.complaint.count({
        where: {
          ...where,
          status: "resolved",
          resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return res.json({
      department: department || "all",
      total,
      pending,
      processing,
      resolved,
      rejected,
      todayResolved: todayApproved,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
