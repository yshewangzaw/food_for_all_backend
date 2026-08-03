const crypto = require("crypto");

// 6-digit numeric OTP for phone verification
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Long random token for password reset links
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = { generateOtp, generateResetToken };