const crypto = require("crypto");

/** Generate SUVIDHA ID: SUV + year + 6-digit random */
function generateSuvidhaId() {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(100000, 999999);
  return `SUV${year}${random}`;
}

/** Generate Ticket ID: prefix + timestamp-based */
function generateTicketId(prefix = "TKT") {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomInt(1000, 9999);
  return `${prefix}-${ts}${rand}`;
}

/** Generate 6-digit OTP */
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

module.exports = { generateSuvidhaId, generateTicketId, generateOtp };
