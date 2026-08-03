const { User } = require("../models");

/**
 * Generates a unique referral code, e.g. FFA7K2M9.
 * Retries on the rare chance of a collision.
 */
const generateReferralCode = async () => {
  const prefix = "FFA";
  let code;
  let exists = true;

  while (exists) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    code = `${prefix}${random}`;
    const existing = await User.findOne({ where: { referralCode: code } });
    exists = !!existing;
  }

  return code;
};

module.exports = generateReferralCode;