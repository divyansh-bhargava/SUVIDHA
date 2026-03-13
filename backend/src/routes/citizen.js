const express = require("express");
const prisma = require("../config/db");
const { authCitizen } = require("../middleware/auth");

const router = express.Router();

// All citizen routes require authentication
router.use(authCitizen);

// ─── GET /api/citizen/profile ────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const citizen = await prisma.citizen.findUnique({
      where: { id: req.citizen.id },
      include: {
        documents: { orderBy: { uploadDate: "desc" } },
      },
    });

    if (!citizen) {
      return res.status(404).json({ error: "Citizen not found" });
    }

    return res.json({
      id: citizen.id,
      suvidhaId: citizen.suvidhaId,
      name: citizen.name,
      nameHi: citizen.nameHi,
      phone: citizen.phone,
      email: citizen.email,
      address: citizen.address,
      addressHi: citizen.addressHi,
      city: citizen.city,
      cityHi: citizen.cityHi,
      ward: citizen.ward,
      aadhaarLast4: citizen.aadhaarLast4,
      documents: citizen.documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        uploadDate: d.uploadDate,
        expiryDate: d.expiryDate,
        lastUsed: d.lastUsed,
      })),
    });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
