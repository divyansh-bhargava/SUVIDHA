const express = require("express");
const prisma = require("../config/db");
const { authCitizen, authAdmin } = require("../middleware/auth");
const { generateTicketId } = require("../utils/generateId");

const router = express.Router();

const REQUIRED_DOC_TYPES = ["identity", "address", "property"];
const CONNECTION_CATEGORIES = ["domestic", "commercial"];
const OWNERSHIP_TYPES = ["owner", "tenant"];
const LOAD_CATEGORIES = ["small", "medium", "large", "commercial"];

function toTimeline(request) {
  return [
    { step: "Application Drafted", done: true, date: request.createdAt },
    {
      step: "Application Submitted",
      done: Boolean(request.electricityConnection?.submittedAt),
      date: request.electricityConnection?.submittedAt || null,
    },
    {
      step: "Under Processing",
      done: ["processing", "approved", "rejected"].includes(request.status),
      date: ["processing", "approved", "rejected"].includes(request.status) ? request.updatedAt : null,
    },
    {
      step: request.status === "approved" ? "Approved" : "Final Decision",
      done: ["approved", "rejected"].includes(request.status),
      date: ["approved", "rejected"].includes(request.status) ? request.updatedAt : null,
    },
  ];
}

function parsePagination(query) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getConnectionForCitizen(ticketId, citizenId) {
  return prisma.serviceRequest.findFirst({
    where: {
      ticketId,
      citizenId,
      department: "electricity",
      serviceType: "new_connection",
    },
    include: {
      citizen: {
        select: {
          id: true,
          name: true,
          suvidhaId: true,
          phone: true,
          address: true,
          city: true,
          ward: true,
        },
      },
      electricityConnection: true,
      documents: {
        include: {
          document: {
            select: {
              id: true,
              name: true,
              type: true,
              fileName: true,
              status: true,
              uploadDate: true,
            },
          },
        },
      },
    },
  });
}

async function getConnectionForAdmin(ticketId) {
  return prisma.serviceRequest.findFirst({
    where: {
      ticketId,
      department: "electricity",
      serviceType: "new_connection",
    },
    include: {
      citizen: {
        select: {
          id: true,
          name: true,
          suvidhaId: true,
          phone: true,
          address: true,
          city: true,
          ward: true,
        },
      },
      electricityConnection: true,
      documents: {
        include: {
          document: {
            select: {
              id: true,
              name: true,
              type: true,
              fileName: true,
              status: true,
              uploadDate: true,
            },
          },
        },
      },
    },
  });
}

function formatConnectionResponse(request) {
  return {
    id: request.id,
    ticketId: request.ticketId,
    status: request.status,
    remarks: request.remarks,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    citizen: request.citizen,
    details: request.electricityConnection,
    documents: request.documents.map((rd) => rd.document),
    timeline: toTimeline(request),
  };
}

function validateRequiredStepData(request) {
  const details = request.electricityConnection;
  if (!details) {
    return "Application details not initialized";
  }

  if (!details.connectionCategory || !details.ownership || !details.loadCategory || !details.loadLabel) {
    return "Connection type details are incomplete";
  }

  if (!details.applicantName || !details.fatherSpouseName || !details.phone) {
    return "Applicant details are incomplete";
  }

  if (!details.installationAddress) {
    return "Installation address is incomplete";
  }

  const attachedTypes = new Set(request.documents.map((d) => d.document.type));
  const missing = REQUIRED_DOC_TYPES.filter((docType) => !attachedTypes.has(docType));
  if (missing.length > 0) {
    return "Missing required document types: " + missing.join(", ");
  }

  return null;
}

// Citizen routes
router.use("/connections", authCitizen);

// Create draft connection application
router.post("/connections", async (req, res) => {
  try {
    const ticketId = generateTicketId("ELEC");

    const created = await prisma.serviceRequest.create({
      data: {
        ticketId,
        citizenId: req.citizen.id,
        department: "electricity",
        serviceType: "new_connection",
        description: "New electricity connection request",
        status: "pending",
        electricityConnection: {
          create: {
            applicantName: req.body.applicantName || null,
            phone: req.body.phone || null,
            email: req.body.email || null,
          },
        },
      },
      include: {
        electricityConnection: true,
      },
    });

    return res.status(201).json({
      message: "Electricity connection draft created",
      ticketId: created.ticketId,
      id: created.id,
      status: created.status,
      details: created.electricityConnection,
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.error("Create electricity draft error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save step 1: connection type
router.patch("/connections/:ticketId/connection-type", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { connectionCategory, ownership, loadCategory, loadLabel } = req.body;

    if (!CONNECTION_CATEGORIES.includes(connectionCategory)) {
      return res.status(400).json({
        error: "Invalid connectionCategory. Must be one of: " + CONNECTION_CATEGORIES.join(", "),
      });
    }

    if (!OWNERSHIP_TYPES.includes(ownership)) {
      return res.status(400).json({
        error: "Invalid ownership. Must be one of: " + OWNERSHIP_TYPES.join(", "),
      });
    }

    if (!LOAD_CATEGORIES.includes(loadCategory) || !loadLabel) {
      return res.status(400).json({
        error: "Invalid load data. loadCategory must be one of: " + LOAD_CATEGORIES.join(", "),
      });
    }

    const request = await getConnectionForCitizen(ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    if (request.status === "approved" || request.status === "rejected") {
      return res.status(409).json({ error: "Cannot edit a finalized application" });
    }

    const updated = await prisma.electricityConnection.update({
      where: { serviceRequestId: request.id },
      data: {
        connectionCategory,
        ownership,
        loadCategory,
        loadLabel,
      },
    });

    return res.json({
      message: "Connection type details saved",
      ticketId: request.ticketId,
      details: updated,
    });
  } catch (err) {
    console.error("Save electricity connection type error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save step 2: applicant details
router.patch("/connections/:ticketId/applicant", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { applicantName, fatherSpouseName, phone, email } = req.body;

    if (!applicantName || !fatherSpouseName || !phone) {
      return res.status(400).json({ error: "applicantName, fatherSpouseName and phone are required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "phone must be exactly 10 digits" });
    }

    const request = await getConnectionForCitizen(ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    if (request.status === "approved" || request.status === "rejected") {
      return res.status(409).json({ error: "Cannot edit a finalized application" });
    }

    const updated = await prisma.electricityConnection.update({
      where: { serviceRequestId: request.id },
      data: {
        applicantName: applicantName.trim(),
        fatherSpouseName: fatherSpouseName.trim(),
        phone,
        email: email || null,
      },
    });

    return res.json({
      message: "Applicant details saved",
      ticketId: request.ticketId,
      details: updated,
    });
  } catch (err) {
    console.error("Save electricity applicant error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save step 3: installation address
router.patch("/connections/:ticketId/address", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { useRegisteredAddress, address } = req.body;

    const request = await getConnectionForCitizen(ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    if (request.status === "approved" || request.status === "rejected") {
      return res.status(409).json({ error: "Cannot edit a finalized application" });
    }

    let installationAddress = "";
    let addressJson = null;

    if (useRegisteredAddress) {
      installationAddress = [request.citizen.address, request.citizen.city, request.citizen.ward]
        .filter(Boolean)
        .join(", ");
      if (!installationAddress) {
        return res.status(400).json({
          error: "Registered address is empty. Please provide a custom installation address",
        });
      }
      addressJson = { mode: "registered" };
    } else {
      if (!address || !address.house || !address.street || !address.city || !/^\d{6}$/.test(address.pin || "")) {
        return res.status(400).json({
          error: "When useRegisteredAddress is false, address.house, address.street, address.city and 6-digit address.pin are required",
        });
      }

      installationAddress = `${address.house}, ${address.street}, ${address.city}, ${address.pin}`;
      addressJson = {
        mode: "custom",
        house: address.house,
        street: address.street,
        city: address.city,
        pin: address.pin,
      };
    }

    const updated = await prisma.electricityConnection.update({
      where: { serviceRequestId: request.id },
      data: {
        useRegisteredAddress: Boolean(useRegisteredAddress),
        installationAddress,
        addressJson,
      },
    });

    return res.json({
      message: "Installation address saved",
      ticketId: request.ticketId,
      details: updated,
    });
  } catch (err) {
    console.error("Save electricity address error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save step 4: attach selected documents
router.patch("/connections/:ticketId/documents", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: "documentIds must be a non-empty array" });
    }

    const request = await getConnectionForCitizen(ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    if (request.status === "approved" || request.status === "rejected") {
      return res.status(409).json({ error: "Cannot edit a finalized application" });
    }

    const docs = await prisma.document.findMany({
      where: {
        id: { in: [...new Set(documentIds)] },
        citizenId: req.citizen.id,
      },
      select: { id: true, type: true, status: true },
    });

    if (docs.length !== [...new Set(documentIds)].length) {
      return res.status(400).json({ error: "Some documents are invalid or not owned by this citizen" });
    }

    await prisma.$transaction([
      prisma.requestDocument.deleteMany({ where: { serviceRequestId: request.id } }),
      prisma.requestDocument.createMany({
        data: docs.map((doc) => ({
          serviceRequestId: request.id,
          documentId: doc.id,
        })),
      }),
    ]);

    return res.json({
      message: "Documents attached successfully",
      ticketId: request.ticketId,
      attachedDocumentIds: docs.map((d) => d.id),
    });
  } catch (err) {
    console.error("Attach electricity documents error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get review payload
router.get("/connections/:ticketId/review", async (req, res) => {
  try {
    const request = await getConnectionForCitizen(req.params.ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    return res.json(formatConnectionResponse(request));
  } catch (err) {
    console.error("Get electricity review error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Submit application after all steps
router.post("/connections/:ticketId/submit", async (req, res) => {
  try {
    const request = await getConnectionForCitizen(req.params.ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    if (request.electricityConnection?.submittedAt) {
      return res.status(409).json({ error: "Application already submitted" });
    }

    const validationError = validateRequiredStepData(request);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: request.id },
        data: {
          status: "processing",
          description: "New electricity connection request submitted",
        },
      }),
      prisma.electricityConnection.update({
        where: { serviceRequestId: request.id },
        data: { submittedAt: new Date() },
      }),
    ]);

    return res.json({
      message: "Electricity connection application submitted",
      ticketId: updatedRequest.ticketId,
      status: updatedRequest.status,
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Submit electricity application error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List citizen's electricity connection requests
router.get("/connections", async (req, res) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: {
        citizenId: req.citizen.id,
        department: "electricity",
        serviceType: "new_connection",
      },
      include: { electricityConnection: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(
      requests.map((r) => ({
        id: r.id,
        ticketId: r.ticketId,
        status: r.status,
        loadCategory: r.electricityConnection?.loadCategory || null,
        submittedAt: r.electricityConnection?.submittedAt || null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }))
    );
  } catch (err) {
    console.error("List electricity requests error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Track one request by ticketId
router.get("/connections/:ticketId", async (req, res) => {
  try {
    const request = await getConnectionForCitizen(req.params.ticketId, req.citizen.id);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    return res.json(formatConnectionResponse(request));
  } catch (err) {
    console.error("Track electricity request error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
router.get("/admin/connections", authAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "master" && req.admin.department !== "electricity") {
      return res.status(403).json({ error: "Not authorized for electricity department" });
    }

    const { status, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const where = {
      department: "electricity",
      serviceType: "new_connection",
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { ticketId: { contains: search, mode: "insensitive" } },
        { citizen: { name: { contains: search, mode: "insensitive" } } },
        { citizen: { suvidhaId: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          citizen: { select: { name: true, suvidhaId: true, phone: true } },
          electricityConnection: {
            select: {
              connectionCategory: true,
              ownership: true,
              loadCategory: true,
              submittedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return res.json({
      data: rows.map((r) => ({
        id: r.id,
        ticketId: r.ticketId,
        status: r.status,
        citizen: r.citizen,
        details: r.electricityConnection,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin list electricity requests error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/connections/:ticketId", authAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "master" && req.admin.department !== "electricity") {
      return res.status(403).json({ error: "Not authorized for electricity department" });
    }

    const request = await getConnectionForAdmin(req.params.ticketId);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    return res.json(formatConnectionResponse(request));
  } catch (err) {
    console.error("Admin get electricity request error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/connections/:ticketId/status", authAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "master" && req.admin.department !== "electricity") {
      return res.status(403).json({ error: "Not authorized for electricity department" });
    }

    const { status, remarks } = req.body;
    const validStatuses = ["processing", "approved", "rejected", "needs_correction"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    if ((status === "rejected" || status === "needs_correction") && !remarks) {
      return res.status(400).json({ error: "remarks are required for rejected/needs_correction status" });
    }

    const request = await getConnectionForAdmin(req.params.ticketId);
    if (!request) {
      return res.status(404).json({ error: "Electricity connection request not found" });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: request.id },
      data: {
        status,
        remarks: remarks || null,
        verifiedBy: req.admin.id,
        verifiedAt: new Date(),
      },
    });

    return res.json({
      message: "Electricity request status updated",
      ticketId: updated.ticketId,
      status: updated.status,
      remarks: updated.remarks,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error("Admin update electricity request status error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
