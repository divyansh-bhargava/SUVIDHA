const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SUVIDHA database...\n");

  // ─── Citizen ────────────────────────────────────────────
  const citizen = await prisma.citizen.upsert({
    where: { suvidhaId: "SUV2024001234" },
    update: {},
    create: {
      suvidhaId: "SUV2024001234",
      name: "Rajesh Kumar",
      nameHi: "राजेश कुमार",
      phone: "9876543210",
      email: "rajesh.kumar@example.com",
      aadhaarLast4: "4321",
      dob: new Date("1990-05-15"),
      address: "42, MG Road, Sector 5",
      addressHi: "42, एमजी रोड, सेक्टर 5",
      city: "Bhopal",
      cityHi: "भोपाल",
      ward: "Ward 12",
    },
  });
  console.log("✓ Citizen created:", citizen.suvidhaId, citizen.name);

  // ─── Admin Users ────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const masterAdmin = await prisma.adminUser.upsert({
    where: { email: "master@suvidha.gov.in" },
    update: {},
    create: {
      name: "System Administrator",
      nameHi: "सिस्टम प्रशासक",
      email: "master@suvidha.gov.in",
      password: hashedPassword,
      role: "master",
      city: "Bhopal",
      cityHi: "भोपाल",
    },
  });
  console.log("✓ Master admin created:", masterAdmin.email);

  const elecAdmin = await prisma.adminUser.upsert({
    where: { email: "electricity@suvidha.gov.in" },
    update: {},
    create: {
      name: "Priya Sharma",
      nameHi: "प्रिया शर्मा",
      email: "electricity@suvidha.gov.in",
      password: hashedPassword,
      role: "department",
      department: "electricity",
      city: "Bhopal",
      cityHi: "भोपाल",
    },
  });
  console.log("✓ Electricity admin created:", elecAdmin.email);

  const waterAdmin = await prisma.adminUser.upsert({
    where: { email: "water@suvidha.gov.in" },
    update: {},
    create: {
      name: "Amit Singh",
      nameHi: "अमित सिंह",
      email: "water@suvidha.gov.in",
      password: hashedPassword,
      role: "department",
      department: "water",
      city: "Bhopal",
      cityHi: "भोपाल",
    },
  });
  console.log("✓ Water admin created:", waterAdmin.email);

  // ─── Sample Complaints ─────────────────────────────────
  const complaints = [
    {
      ticketId: "TKT-SAMPLE001",
      citizenId: citizen.id,
      department: "electricity",
      type: "Power Outage",
      description: "No electricity in Sector 5 since yesterday evening. Transformer seems damaged.",
      status: "pending",
    },
    {
      ticketId: "TKT-SAMPLE002",
      citizenId: citizen.id,
      department: "water",
      type: "Low Pressure",
      description: "Very low water pressure on 2nd floor since last week. Ground floor is fine.",
      status: "processing",
    },
    {
      ticketId: "TKT-SAMPLE003",
      citizenId: citizen.id,
      department: "municipal",
      type: "Road Damage",
      description: "Large pothole on MG Road near sector 5 crossing. Dangerous for two-wheelers.",
      status: "resolved",
      remarks: "Road repair completed on 10-Mar-2026.",
      resolvedAt: new Date("2026-03-10"),
    },
  ];

  for (const c of complaints) {
    await prisma.complaint.upsert({
      where: { ticketId: c.ticketId },
      update: {},
      create: c,
    });
    console.log("✓ Complaint created:", c.ticketId, `(${c.status})`);
  }

  // ─── Sample Bills ──────────────────────────────────────
  const bills = [
    {
      citizenId: citizen.id,
      service: "electricity",
      consumerNumber: "ELEC-BPL-204512",
      amount: 1450.0,
      dueDate: new Date("2026-03-25"),
      period: "Feb 2026",
      status: "unpaid",
    },
    {
      citizenId: citizen.id,
      service: "water",
      consumerNumber: "WTR-BPL-112233",
      amount: 350.0,
      dueDate: new Date("2026-03-20"),
      period: "Feb 2026",
      status: "unpaid",
    },
    {
      citizenId: citizen.id,
      service: "gas",
      consumerNumber: "GAS-BPL-556677",
      amount: 890.0,
      dueDate: new Date("2026-02-28"),
      period: "Jan 2026",
      status: "paid",
      paidAt: new Date("2026-02-25"),
      transactionId: "TXN2026022500123",
    },
  ];

  for (const b of bills) {
    await prisma.bill.create({ data: b });
    console.log("✓ Bill created:", b.consumerNumber, `₹${b.amount} (${b.status})`);
  }

  console.log("\n✅ Seed complete!");
  console.log("\n── Test Credentials ──────────────────────────");
  console.log("Citizen SUVIDHA ID : SUV2024001234");
  console.log("Master Admin       : master@suvidha.gov.in / admin123");
  console.log("Electricity Admin  : electricity@suvidha.gov.in / admin123");
  console.log("Water Admin        : water@suvidha.gov.in / admin123");
  console.log("──────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
