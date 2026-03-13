const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/db");

/**
 * Middleware: Authenticate citizen via JWT Bearer token.
 * Attaches req.citizen with { id, suvidhaId, phone }
 */
async function authCitizen(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    if (decoded.role === "citizen") {
      req.citizen = { id: decoded.id, suvidhaId: decoded.suvidhaId, phone: decoded.phone };
      return next();
    }
    return res.status(403).json({ error: "Not a citizen token" });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: Authenticate admin via JWT Bearer token.
 * Attaches req.admin with { id, role, department }
 */
async function authAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    if (["master", "department", "staff"].includes(decoded.role)) {
      req.admin = { id: decoded.id, role: decoded.role, department: decoded.department };
      return next();
    }
    return res.status(403).json({ error: "Not an admin token" });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authCitizen, authAdmin };
