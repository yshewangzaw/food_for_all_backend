const { Op } = require('sequelize');

function buildUserWhere(q) {
  const where = {};

  // --- exact matches ---
  if (q.role) where.role = q.role;
  if (q.status) where.status = q.status;
  if (q.kycStatus) where.kycStatus = q.kycStatus;
  if (q.city) where.city = q.city;
  if (q.sponsorId) where.sponsorId = q.sponsorId;

  // --- depth: exact wins over range ---
  if (q.depth !== undefined) {
    where.depth = q.depth;
  } else if (q.minDepth !== undefined || q.maxDepth !== undefined) {
    where.depth = {};
    if (q.minDepth !== undefined) where.depth[Op.gte] = q.minDepth;
    if (q.maxDepth !== undefined) where.depth[Op.lte] = q.maxDepth;
  }

  if (q.minDirectReferrals !== undefined) {
    where.directReferralCount = { [Op.gte]: q.minDirectReferrals };
  }

  // --- nullable-field booleans ---
  if (q.activated !== undefined) {
    where.activatedAt = q.activated ? { [Op.ne]: null } : { [Op.is]: null };
  }
  if (q.phoneVerified !== undefined) {
    where.phoneVerifiedAt = q.phoneVerified ? { [Op.ne]: null } : { [Op.is]: null };
  }
  if (q.hasWalletBalance !== undefined) {
    where.wallet = q.hasWalletBalance ? { [Op.gt]: 0 } : { [Op.lte]: 0 };
  }

  // --- date range ---
  if (q.createdFrom || q.createdTo) {
    where.createdAt = {};
    if (q.createdFrom) where.createdAt[Op.gte] = q.createdFrom;
    if (q.createdTo) where.createdAt[Op.lte] = q.createdTo;
  }

  // --- search across name, email, phone, referralCode ---
  if (q.search) {
    const term = `%${q.search}%`;
    where[Op.or] = [
      { fullName: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { referralCode: { [Op.like]: term } },
    ];
  }

  return where;
}

module.exports = { buildUserWhere };