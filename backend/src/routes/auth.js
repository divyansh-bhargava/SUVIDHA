const express = require("express");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");
const { generateSuvidhaId, generateOtp } = require("../utils/generateId");

const router = express.Router();

// ─── POST /api/auth/register ─────────────────────────────
// Citizen self-registration → generates SUVIDHA ID
router.post("/register", async (req, res) => {
  try {
    const { name, nameHi, phone, aadhaarLast4, dob, address, addressHi, city, cityHi, ward, email } = req.body;

    if (!name || !phone || !aadhaarLast4) {
      return res.status(400).json({ error: "name, phone, and aadhaarLast4 are required" });
    }

    if (!/^\d{4}$/.test(aadhaarLast4)) {
      return res.status(400).json({ error: "aadhaarLast4 must be exactly 4 digits" });
    }

    // Check if phone already registered
    const existing = await prisma.citizen.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: "Phone number already registered", suvidhaId: existing.suvidhaId });
    }

    const suvidhaId = generateSuvidhaId();

    const citizen = await prisma.citizen.create({
      data: {
        suvidhaId,
        name,
        nameHi: nameHi || "",
        phone,
        email: email || null,
        aadhaarLast4,
        dob: dob ? new Date(dob) : null,
        address: address || "",
        addressHi: addressHi || "",
        city: city || "",
        cityHi: cityHi || "",
        ward: ward || "",
      },
    });

    return res.status(201).json({
      message: "Registration successful",
      suvidhaId: citizen.suvidhaId,
      citizenId: citizen.id,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/send-otp ─────────────────────────────
// Send OTP to citizen's phone (mock in dev, NIC SMS gateway in prod)
router.post("/send-otp", async (req, res) => {
  try {
    const { suvidhaId } = req.body;

    if (!suvidhaId) {
      return res.status(400).json({ error: "suvidhaId is required" });
    }

    const citizen = await prisma.citizen.findUnique({ where: { suvidhaId } });
    if (!citizen) {
      return res.status(404).json({ error: "SUVIDHA ID not found" });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.create({
      data: { phone: citizen.phone, code, expiresAt },
    });

    // In production: send via NIC SMS gateway
    // For dev: log to console
    console.log(`[DEV OTP] ${citizen.phone} → ${code}`);

    return res.json({
      message: "OTP sent successfully",
      phone: citizen.phone.replace(/.(?=.{4})/g, "*"), // mask phone
      // DEV ONLY — remove in production:
      ...(process.env.NODE_ENV === "development" && { _devOtp: code }),
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────
// Verify OTP → return JWT token + citizen data
router.post("/verify-otp", async (req, res) => {
  try {
    const { suvidhaId, otp } = req.body;

    if (!suvidhaId || !otp) {
      return res.status(400).json({ error: "suvidhaId and otp are required" });
    }

    const citizen = await prisma.citizen.findUnique({ where: { suvidhaId } });
    if (!citizen) {
      return res.status(404).json({ error: "SUVIDHA ID not found" });
    }

    // Find valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: citizen.phone,
        code: otp,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // Mark OTP as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Issue JWT
    const token = signToken({
      id: citizen.id,
      suvidhaId: citizen.suvidhaId,
      phone: citizen.phone,
      role: "citizen",
    });

    return res.json({
      message: "Login successful",
      token,
      citizen: {
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
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/admin/login ──────────────────────────
// Admin login with email + password
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const bcrypt = require("bcrypt");
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({
      id: admin.id,
      role: admin.role,
      department: admin.department,
    });

    return res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        nameHi: admin.nameHi,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        city: admin.city,
        cityHi: admin.cityHi,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
